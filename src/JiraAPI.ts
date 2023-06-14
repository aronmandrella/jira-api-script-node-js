import nodeFetch from "node-fetch";
import z, { ZodError } from "zod";
import { createPaginationChunks } from "./createPaginationChunks";

/**
 * NOTE:
 * In NodeJS 18.0.0+ compatible environment, native fetch would be used instead.
 */
declare global {
	let fetch: typeof nodeFetch;
}
fetch = nodeFetch;

/* -------------------------------------------------------------------------- */
/*                                CUSTOM ERRORS                               */
/* -------------------------------------------------------------------------- */

export class JiraResponseError extends Error {
	readonly status: number;
	readonly url: string | URL;

	constructor({
		url,
		status,
		message
	}: {
		url: string | URL;
		status: number;
		message: string;
	}) {
		super(message);
		this.url = url;
		this.status = status;
		this.name = "JiraResponseError";
	}
}

/* -------------------------------------------------------------------------- */
/*                                   SCHEMAS                                  */
/* -------------------------------------------------------------------------- */

/**
 * NOTE:
 *
 * Zod was used to ensure a full end-to-end type-safety of the fetched data at runtime.
 *
 * That being said, Jira API is probably trustworthy, and zod adds some CPU/memory overhead.
 * thus in most scenarios a basic type assertion with `as` operator could be "good enough" too.
 *
 * Best approach when it comes to data validation (assertion vs parsing) depends on a given use case.
 */

export type GetComponentsResponse = z.infer<typeof GetComponentsResponseSchema>;

export const GetComponentsResponseSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		lead: z
			.object({
				accountId: z.string(),
				displayName: z.string()
			})
			.optional()
	})
	.array();

export type GetIssuesByComponentsResponse = z.infer<
	typeof GetIssuesByComponentsResponseSchema
>;

export const GetIssuesByComponentsResponseSchema = z.object({
	startAt: z.number(),
	maxResults: z.number(),
	total: z.number(),
	issues: z
		.object({
			id: z.string(),
			fields: z.object({
				components: z
					.object({
						id: z.string(),
						name: z.string()
					})
					.array()
			})
		})
		.array()
});

/* -------------------------------------------------------------------------- */
/*                                     API                                    */
/* -------------------------------------------------------------------------- */

export class JiraAPI {
	private readonly config: Readonly<{
		baseUrl: string;
		projectId: string;
	}>;

	constructor(jiraApiConfig: JiraAPI["config"]) {
		this.config = jiraApiConfig;
	}

	/**
	 * @see https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-project-components/#api-rest-api-3-project-projectidorkey-components-get
	 * @throws {ZodError | JiraResponseError}
	 */
	async getComponents(): Promise<GetComponentsResponse> {
		const { baseUrl, projectId } = this.config;

		const url = `${baseUrl}/rest/api/3/project/${projectId}/components`;
		const res = await fetch(url);

		if (res.status !== 200) {
			throw new JiraResponseError({
				url: url,
				status: res.status,
				message: res.statusText
			});
		}

		const json: unknown = await res.json();

		return GetComponentsResponseSchema.parse(json);
	}

	/**
	 * @see https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-rest-api-3-search-get
	 * @throws {ZodError | JiraResponseError}
	 */
	async getIssuesByComponents(query: {
		componentIds: string[];
	}): Promise<GetIssuesByComponentsResponse["issues"]> {
		const { baseUrl, projectId } = this.config;
		const { componentIds } = query;

		/* 
			Random big number, we want to fetch as many items as possible,
			but according to docs Jira will reduce this number (to for example `100`),
			based on some criteria, and return reduced value in a response.
		*/
		const initialMaxResults = "10000";

		const url = new URL(`${baseUrl}/rest/api/3/search`);
		url.searchParams.set("startAt", "0");
		url.searchParams.set("maxResults", initialMaxResults);
		url.searchParams.set("validateQuery", "strict");
		url.searchParams.set("fields", "id,components");
		url.searchParams.set(
			"jql",
			`project = ${projectId} AND component IN (${componentIds.join(", ")})`
		);

		const firstRes = await fetch(url);

		if (firstRes.status !== 200) {
			throw new JiraResponseError({
				url: url,
				status: firstRes.status,
				message: firstRes.statusText
			});
		}

		const firstJson: unknown = await firstRes.json();
		const firstData = GetIssuesByComponentsResponseSchema.parse(firstJson);
		const firstIssueBatch = firstData.issues;

		const restIssueBatchesPagination = createPaginationChunks({
			pageSize: firstData.maxResults,
			total: firstData.total
		}).slice(1);

		const restIssueBatches = await Promise.all(
			restIssueBatchesPagination.map(async ({ startAt, pageSize }) => {
				url.searchParams.set("startAt", String(startAt));
				url.searchParams.set("maxResults", String(pageSize));

				const res = await fetch(url);

				if (res.status !== 200) {
					throw new JiraResponseError({
						url: url,
						status: res.status,
						message: res.statusText
					});
				}

				const json: unknown = await res.json();
				const data = GetIssuesByComponentsResponseSchema.parse(json);
				const issueBatch = data.issues;

				return issueBatch;
			})
		);

		return [firstIssueBatch, ...restIssueBatches].flat();
	}
}
