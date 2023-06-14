import os from "node:os";
import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	jest
} from "@jest/globals";
import fetchMock from "fetch-mock";
import stripAnsi from "strip-ansi";
import ExampleGetComponentsResponse from "./__fixtures__/GetComponentsResponse.json";
import ExampleGetIssuesByComponentsResponse from "./__fixtures__/GetIssuesByComponentsResponse.json";
import { app } from "./app";

const VALID_CLI_ARGUMENTS: Record<string, string> = {
	"--jira-base-url": "https://herocoders.atlassian.net",
	"--jira-project-id": "SP"
};

const INVALID_CLI_ARGUMENTS: Record<string, string> = {
	"--jira-base-url": "https://xxx.atlassian.net",
	"--jira-project-id": "XXX"
};

function setArgv(args: string[]) {
	process.argv = ["node.exe", "app.js", ...args];
}

describe("app", () => {
	let stderr: string;
	let stdout: string;

	jest.spyOn(console, "log").mockImplementation((...data) => {
		stdout += stripAnsi(data.map(String).join(" ") + os.EOL);
	});

	jest.spyOn(console, "error").mockImplementation((...data) => {
		stderr += stripAnsi(data.map(String).join(" ") + os.EOL);
	});

	beforeEach(() => {
		stderr = "";
		stdout = "";
		setArgv([]);
	});

	afterEach(() => {
		fetchMock.restore();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	describe("e2e", () => {
		it.each(Object.keys(VALID_CLI_ARGUMENTS))(
			"should fail when '%s' CLI argument is missing",
			async (argumentName) => {
				expect.hasAssertions();

				const filteredArgs = Object.entries(VALID_CLI_ARGUMENTS)
					.filter(([key]) => {
						return key !== argumentName;
					})
					.flat();

				setArgv(filteredArgs);
				await expect(app()).resolves.toBeUndefined();
				expect(process.exitCode).toBe(1);
				expect(stderr).toContain(`error: required option '${argumentName}`);
			}
		);

		it.each(Object.keys(VALID_CLI_ARGUMENTS))(
			"should fail when '%s' CLI argument is invalid",
			async (argumentName) => {
				expect.hasAssertions();

				const corruptedArgs = Object.entries({
					...VALID_CLI_ARGUMENTS,
					[argumentName]: String(INVALID_CLI_ARGUMENTS[argumentName])
				}).flat();

				setArgv(corruptedArgs);
				await expect(app()).resolves.toBeUndefined();
				expect(process.exitCode).toBe(1);
				expect(stderr).toContain(`JiraResponseError`);
			}
		);

		it("should succeed when CLI arguments are valid", async () => {
			expect.hasAssertions();

			setArgv(Object.entries(VALID_CLI_ARGUMENTS).flat());
			await expect(app()).resolves.toBeUndefined();
			expect(process.exitCode).toBe(0);

			expect(stdout).toMatchSnapshot();
		});
	});

	describe("mocked", () => {
		const MOCK_CLI_ARGUMENTS = INVALID_CLI_ARGUMENTS;

		const baseUrl = String(MOCK_CLI_ARGUMENTS["--jira-base-url"]);
		const projectId = String(MOCK_CLI_ARGUMENTS["--jira-project-id"]);

		it("should fail when API responses are not valid", async () => {
			expect.hasAssertions();

			fetchMock.mock(`${baseUrl}/rest/api/3/project/${projectId}/components`, {
				status: 400
			});
			fetchMock.mock(`begin:${baseUrl}/rest/api/3/search`, {
				status: 400
			});

			setArgv(Object.entries(MOCK_CLI_ARGUMENTS).flat());
			await expect(app()).resolves.toBeUndefined();
			expect(process.exitCode).toBe(1);
		});

		it("should succeed when API responses are valid", async () => {
			expect.hasAssertions();

			fetchMock.mock(`${baseUrl}/rest/api/3/project/${projectId}/components`, {
				status: 200,
				body: ExampleGetComponentsResponse
			});

			fetchMock.mock(`begin:${baseUrl}/rest/api/3/search`, {
				status: 200,
				body: ExampleGetIssuesByComponentsResponse
			});

			setArgv(Object.entries(MOCK_CLI_ARGUMENTS).flat());
			await expect(app()).resolves.toBeUndefined();
			expect(process.exitCode).toBe(0);

			expect(stdout).toMatchSnapshot();
		});

		it("should correctly handle a case without components", async () => {
			expect.hasAssertions();

			fetchMock.mock(`${baseUrl}/rest/api/3/project/${projectId}/components`, {
				status: 200,
				body: []
			});

			fetchMock.mock(`begin:${baseUrl}/rest/api/3/search`, {
				status: 200,
				body: ExampleGetIssuesByComponentsResponse
			});

			setArgv(Object.entries(MOCK_CLI_ARGUMENTS).flat());
			await expect(app()).resolves.toBeUndefined();
			expect(process.exitCode).toBe(0);

			expect(stdout).toMatchSnapshot();
		});
	});
});
