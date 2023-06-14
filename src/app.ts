import { Command, CommanderError } from "@commander-js/extra-typings";
import chalk from "chalk";
import { JiraAPI } from "./JiraAPI";

export async function getJiraComponentsWithoutLead(query: {
	baseUrl: string;
	projectId: string;
}): Promise<{ id: string; name: string; issues: number }[]> {
	const { baseUrl, projectId } = query;

	const api = new JiraAPI({ baseUrl, projectId });

	const components = await api.getComponents();

	const componentsWithoutLead = components.filter((component) => !component.lead);
	if (componentsWithoutLead.length === 0) {
		return [];
	}

	const issues = await api.getIssuesByComponents({
		componentIds: componentsWithoutLead.map((component) => component.id)
	});

	const issuesCountByComponentId = new Map<string, number>();

	for (const issue of issues) {
		for (const component of issue.fields.components) {
			issuesCountByComponentId.set(
				component.id,
				(issuesCountByComponentId.get(component.id) ?? 0) + 1
			);
		}
	}

	return componentsWithoutLead.map((component) => {
		return {
			id: component.id,
			name: component.name,
			issues: issuesCountByComponentId.get(component.id) ?? 0
		};
	});
}

/**
 * Entry point of the CLI ap. It can be used like this:
 * ```sh
 * node app.js --help
 * node app.js --jira-base-url https://abc.atlassian.net --jira-project-id xyz
 * ```
 */
export async function app() {
	try {
		const program = new Command()
			.name("app.js")
			.requiredOption("--jira-base-url <string>")
			.requiredOption("--jira-project-id <string>")
			.showHelpAfterError()
			.exitOverride()
			.configureOutput({
				writeOut: (str) => {
					console.log(str.trim());
				},
				writeErr: (str) => {
					console.error(str.trim());
				},
				outputError: (str, write) => {
					write(chalk.red(str));
				}
			});

		console.log(chalk.cyan.bold("Detecting Jira components without a component lead..."));
		console.log();

		const { jiraBaseUrl, jiraProjectId } = program.parse().opts();

		console.log("• Jira base url:", chalk.bold(jiraBaseUrl));
		console.log("• Jira project: ", chalk.bold(jiraProjectId));
		console.log();

		const components = await getJiraComponentsWithoutLead({
			baseUrl: jiraBaseUrl,
			projectId: jiraProjectId
		});

		if (components.length === 0) {
			console.log(
				chalk.green("Script didn't detect any components without a project lead :)")
			);
		} else {
			console.log(
				chalk.yellow(
					`Script detected ${chalk.bold(
						components.length
					)} component(s) without a project lead:`
				)
			);
			console.log();

			for (const { id, name, issues } of components) {
				console.log(
					chalk.gray(`[ID: ${id}]`),
					chalk.bold(name),
					chalk.magenta(`with ${chalk.bold(issues)} issue(s)`)
				);
			}
		}

		process.exitCode = 0;
	} catch (error) {
		if (error instanceof CommanderError) {
			console.error();
		} else {
			console.error(error);
			console.error();
		}

		console.error(chalk.red("Oops, something went wrong."));
		console.error(chalk.red("The detailed error can be found above this message."));

		process.exitCode = 1;
	}
}

// eslint-disable-next-line unicorn/prefer-module
if (require.main === module) {
	// eslint-disable-next-line @typescript-eslint/no-floating-promises
	app();
}
