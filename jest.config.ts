import path from "node:path";
import type { Config as JestConfig } from "jest";
import { loadConfig } from "tsconfig-paths";

const projectDir = __dirname;

const tsConfig = loadConfig(path.resolve(projectDir, "tsconfig.json"));
if (tsConfig.resultType !== "success") {
	throw new Error("Failed to load tsconfig.json");
}

export default {
	cacheDirectory: path.resolve(projectDir, ".cache", "jest"),

	passWithNoTests: true,
	rootDir: projectDir,
	testMatch: [
		"**/__test__/**/*.+(js|cjs|mjs|jsx|ts|cts|mts|tsx)",
		"**/*.+(spec|test).+(js|cjs|mjs|jsx|ts|cts|mts|tsx)"
	],

	reporters: ["default"],
	testTimeout: 5000,
	clearMocks: true,
	errorOnDeprecated: true,

	testEnvironment: "node",

	injectGlobals: false,
	globalSetup: undefined,
	globalTeardown: undefined,
	globals: undefined,

	transform: {
		"^.+\\.(js|cjs|mjs|jsx|ts|cts|mts|tsx)$": [
			"@swc/jest",
			{
				jsc: {
					baseUrl: tsConfig.absoluteBaseUrl,
					paths: tsConfig.paths
				}
			}
		]
	},

	collectCoverage: true,
	coverageReporters: ["text"],
	collectCoverageFrom: ["src/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}"],
	coverageDirectory: path.resolve(projectDir, "coverage"),
	coveragePathIgnorePatterns: ["/dist/", "/node_modules/"]
} satisfies JestConfig;
