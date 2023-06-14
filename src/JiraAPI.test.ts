import { afterEach, describe, expect, it } from "@jest/globals";
import fetchMock from "fetch-mock";
import { ZodError } from "zod";
import type { GetComponentsResponse, GetIssuesByComponentsResponse } from "./JiraAPI";
import {
	GetComponentsResponseSchema,
	GetIssuesByComponentsResponseSchema,
	JiraAPI,
	JiraResponseError
} from "./JiraAPI";
import ExampleGetComponentsResponse from "./__fixtures__/GetComponentsResponse.json";
import ExampleGetIssuesByComponentsResponse from "./__fixtures__/GetIssuesByComponentsResponse.json";

describe("JiraAPI (mocked)", () => {
	afterEach(() => {
		fetchMock.restore();
	});

	describe("getComponents", () => {
		const baseUrl = "https://xxx.atlassian.net";
		const projectId = "XYZ";
		const config = { baseUrl, projectId };
		const url = `${baseUrl}/rest/api/3/project/${projectId}/components`;

		it("should fail when response status is not ok", async () => {
			expect.hasAssertions();

			fetchMock.mock(url, { status: 400 });

			const api = new JiraAPI(config);
			await expect(api.getComponents()).rejects.toThrow(JiraResponseError);
		});

		it("should fail when response data is not valid", async () => {
			expect.hasAssertions();

			fetchMock.mock(url, { status: 200, body: { abc: "xyz" } });

			const api = new JiraAPI(config);
			await expect(api.getComponents()).rejects.toThrow(ZodError);
		});

		it("should succeed when response data is valid", async () => {
			expect.hasAssertions();

			const body: GetComponentsResponse = ExampleGetComponentsResponse;

			fetchMock.mock(url, { status: 200, body: body });

			const api = new JiraAPI(config);
			await expect(api.getComponents()).resolves.toStrictEqual(
				GetComponentsResponseSchema.parse(body)
			);
		});
	});

	describe("getIssuesByComponents", () => {
		const baseUrl = "https://xxx.atlassian.net";
		const projectId = "XYZ";
		const config = { baseUrl, projectId };
		const url = `begin:${baseUrl}/rest/api/3/search`;
		const query: { componentIds: string[] } = { componentIds: ["a", "b", "c"] };

		it("should fail when response status is not ok", async () => {
			expect.hasAssertions();

			fetchMock.mock(url, { status: 400 });

			const api = new JiraAPI(config);
			await expect(api.getIssuesByComponents(query)).rejects.toThrow(JiraResponseError);
		});

		it("should fail when response data is not valid", async () => {
			expect.hasAssertions();

			fetchMock.mock(url, { status: 200, body: { abc: "xyz" } });

			const api = new JiraAPI(config);
			await expect(api.getIssuesByComponents(query)).rejects.toThrow(ZodError);
		});

		it("should succeed when response data is valid", async () => {
			expect.hasAssertions();

			const body: GetIssuesByComponentsResponse = ExampleGetIssuesByComponentsResponse;

			fetchMock.mock(url, { status: 200, body: body });

			const api = new JiraAPI(config);
			await expect(api.getIssuesByComponents(query)).resolves.toStrictEqual(
				GetIssuesByComponentsResponseSchema.parse(body).issues
			);
		});

		it("should be able to handle paginated responses", async () => {
			expect.hasAssertions();

			const MAX_RESULTS_UPPER_LIMIT = 2;

			const requestHistory: { startAt: number; maxResults: number }[] = [];
			const body: GetIssuesByComponentsResponse = ExampleGetIssuesByComponentsResponse;

			fetchMock.mock(url, (requestUrl: string) => {
				const parsedRequestUrl = new URL(requestUrl);
				const startAt = Number(parsedRequestUrl.searchParams.get("startAt"));
				const maxResults = Number(parsedRequestUrl.searchParams.get("maxResults"));

				requestHistory.push({ startAt, maxResults });

				const clampedMaxResults = Math.min(MAX_RESULTS_UPPER_LIMIT, maxResults);

				const chunk: GetIssuesByComponentsResponse = {
					...body,
					startAt: startAt,
					maxResults: MAX_RESULTS_UPPER_LIMIT,
					issues: ExampleGetIssuesByComponentsResponse.issues.filter((issue, index) => {
						// eslint-disable-next-line jest/no-conditional-in-test
						return index >= startAt && index < startAt + clampedMaxResults;
					})
				};

				return { status: 200, body: chunk };
			});

			const api = new JiraAPI(config);

			await expect(api.getIssuesByComponents(query)).resolves.toStrictEqual(
				GetIssuesByComponentsResponseSchema.parse(body).issues
			);

			expect(requestHistory).toStrictEqual([
				{ startAt: 0, maxResults: 10_000 },
				{ startAt: 2, maxResults: 2 },
				{ startAt: 4, maxResults: 2 },
				{ startAt: 6, maxResults: 2 }
			]);
		});

		it("should be able to forward errors in paginated responses", async () => {
			expect.hasAssertions();

			const MAX_RESULTS_UPPER_LIMIT = 2;
			const body: GetIssuesByComponentsResponse = ExampleGetIssuesByComponentsResponse;

			fetchMock.mock(url, (requestUrl: string) => {
				const parsedRequestUrl = new URL(requestUrl);
				const startAt = Number(parsedRequestUrl.searchParams.get("startAt"));

				// eslint-disable-next-line jest/no-conditional-in-test
				if (startAt > 0) {
					return { status: 400 };
				} else {
					const chunk: GetIssuesByComponentsResponse = {
						...body,
						startAt: startAt,
						maxResults: MAX_RESULTS_UPPER_LIMIT
					};

					return { status: 200, body: chunk };
				}
			});

			const api = new JiraAPI(config);

			await expect(api.getIssuesByComponents(query)).rejects.toThrow(JiraResponseError);
		});
	});
});
