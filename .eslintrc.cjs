"use strict";

const NODE_16_ECMA = 2021;
const NODE_16_SEMVER = ">=16.0.0";
const WORKSPACE_ROOT_DIR = __dirname;

/**
 * Creates ESLint config either for CommonJS files or ESM files.
 * @param {object} opts
 * @param {'module' | 'script'} opts.sourceType
 * @returns {Omit<import("eslint").Linter.ConfigOverride, "files">}
 */
function createTypeScriptConfig(opts) {
	const { sourceType } = opts;

	return {
		parser: "@typescript-eslint/parser",
		parserOptions: {
			tsconfigRootDir: WORKSPACE_ROOT_DIR,
			project: ["./tsconfig.json"],
			sourceType: sourceType,
			ecmaVersion: NODE_16_ECMA
		},
		plugins: ["jsdoc", "n", "unicorn", "@typescript-eslint", "import", "promise"],
		extends: [
			"plugin:jsdoc/recommended-error",
			"eslint:all",
			sourceType === "module"
				? "plugin:n/recommended-module"
				: "plugin:n/recommended-script",
			"plugin:unicorn/recommended",
			"plugin:@typescript-eslint/all",
			"plugin:import/recommended",
			"plugin:import/typescript",
			"plugin:promise/recommended",
			"prettier"
		],
		settings: {
			"import/external-module-folders": ["node_modules"],
			"import/extensions": [".js", ".cjs", ".mjs", ".jsx", ".ts", ".cts", ".mts", ".tsx"],
			"import/resolver": {
				typescript: sourceType === "module",
				node: true
			}
		},
		rules: {
			/*
				Disables overlapping rules.
			*/
			"max-statements-per-line": "off",
			"sort-imports": "off",
			"no-duplicate-imports": "off",
			"lines-around-comment": "off",
			"camelcase": "off",
			"new-cap": "off",
			"multiline-comment-style": "off",
			"n/no-extraneous-require": "off",
			"n/no-extraneous-import": "off",
			"n/no-missing-require": "off",
			"n/no-missing-import": "off",
			"n/no-process-exit": "off",
			"unicorn/no-static-only-class": "off",
			"import/order": "off",

			/*
				Disables opinionated style guides.
			*/
			"arrow-body-style": "off",
			"capitalized-comments": "off",
			"id-length": "off",
			"max-lines-per-function": "off",
			"max-lines": "off",
			"max-statements": "off",
			"no-else-return": "off",
			"no-inline-comments": "off",
			"no-nested-ternary": "off",
			"no-ternary": "off",
			"no-warning-comments": "off",
			"sort-vars": "off",
			"eslint-comments/no-aggregating-enable": "off",
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-member-accessibility": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/consistent-indexed-object-style": "off",
			"unicorn/prefer-query-selector": "off",
			"unicorn/text-encoding-identifier-case": "off",

			/*
				Disables problematic rules.
			*/
			"func-style": "off",
			"line-comment-position": "off",
			"max-classes-per-file": "off",
			"no-console": "off",
			"no-plusplus": "off",
			"no-undefined": "off",
			"prefer-destructuring": "off",
			"prefer-named-capture-group": "off",
			"sort-keys": "off",
			"unicorn/filename-case": "off",
			"unicorn/no-null": "off",
			"unicorn/prevent-abbreviations": "off",
			"unicorn/expiring-todo-comments": "off",
			"unicorn/no-console-spaces": "off",
			"unicorn/no-process-exit": "off",
			"unicorn/prefer-top-level-await": "off",
			"jsdoc/require-jsdoc": "off",
			"jsdoc/require-param-description": "off",
			"jsdoc/require-returns-description": "off",
			"@typescript-eslint/no-type-alias": "off",
			"@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
			"@typescript-eslint/prefer-readonly-parameter-types": "off",
			"@typescript-eslint/sort-type-constituents": "off",
			"@typescript-eslint/strict-boolean-expressions": "off",
			"@typescript-eslint/lines-between-class-members": "off",
			"@typescript-eslint/no-magic-numbers": ["off"],
			"n/no-process-env": "off",
			"import/no-named-as-default-member": "off",
			"import/no-internal-modules": "off",

			/* 
				Custom rules.
			*/
			"class-methods-use-this": "warn",
			"prefer-template": "warn",
			"no-await-in-loop": "warn",
			"array-callback-return": "error",
			"eqeqeq": "error",
			"no-param-reassign": "error",
			"require-unicode-regexp": "error",
			"no-negated-condition": "error",
			"one-var": ["error", "never"],
			"object-shorthand": ["error", "consistent-as-needed"],
			"max-nested-callbacks": ["error", { max: 5 }],
			"max-depth": ["error", { max: 4 }],
			"max-params": ["error", { max: 4 }],
			"spaced-comment": ["error", "always", { markers: ["/"] }],
			"jsdoc/require-asterisk-prefix": "error",
			"n/prefer-promises/fs": "warn",
			"n/prefer-promises/dns": "warn",
			"n/handle-callback-err": "warn",
			"n/callback-return": ["warn", ["callback", "cb", "next", "done", "send", "json"]],
			"n/no-mixed-requires": "error",
			"n/no-new-require": "error",
			"n/no-path-concat": "error",
			"n/prefer-global/url-search-params": "error",
			"n/prefer-global/url": "error",
			"n/prefer-global/text-encoder": "error",
			"n/prefer-global/text-decoder": "error",
			"n/prefer-global/process": "error",
			"n/prefer-global/console": "error",
			"n/prefer-global/buffer": "error",
			"n/exports-style": ["error", "module.exports"],
			"n/no-unsupported-features/es-syntax": ["error", { version: NODE_16_SEMVER }],
			"n/no-unsupported-features/es-builtins": ["error", { version: NODE_16_SEMVER }],
			"n/no-unsupported-features/node-builtins": ["error", { version: NODE_16_SEMVER }],
			"unicorn/explicit-length-check": "warn",
			"unicorn/prefer-ternary": "warn",
			"unicorn/better-regex": "warn",
			"unicorn/no-unused-properties": "warn",
			"unicorn/no-unsafe-regex": "warn",
			"unicorn/prefer-spread": "warn",
			"unicorn/prefer-array-flat-map": "warn",
			"unicorn/prefer-optional-catch-binding": "warn",
			"unicorn/prefer-blob-reading-methods": "warn",
			"unicorn/prefer-string-replace-all": "error",
			"unicorn/require-post-message-target-origin": "error",
			"unicorn/custom-error-definition": "error",
			"unicorn/no-useless-undefined": ["error", { checkArguments: false }],
			"unicorn/prefer-number-properties": ["error", { checkInfinity: false }],
			"unicorn/prefer-module": sourceType === "module" ? "error" : "off",
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-extraneous-class": "warn",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/consistent-type-definitions": ["warn", "type"],
			"@typescript-eslint/no-non-null-assertion": "error",
			"@typescript-eslint/prefer-readonly": "error",
			"@typescript-eslint/parameter-properties": "error",
			"@typescript-eslint/prefer-nullish-coalescing": "error",
			"@typescript-eslint/no-var-requires": sourceType === "module" ? "error" : "off",
			"@typescript-eslint/no-require-imports": sourceType === "module" ? "error" : "off",
			"@typescript-eslint/ban-types": [
				"warn",
				{
					extendDefaults: true,
					types: {
						"object": {
							message: [
								'`object` actually means "any object-like value" (including class instances and arrays).',
								'- Use `Record<string, unknown>` if you want a type meaning "any plain object".',
								'- Use `Record<string, never>` if you want a type meaning "any empty plain object".'
							].join("\n")
						},
						"{}": {
							message: [
								'`{}` actually means "any non-nullable value".',
								'- Use `Record<string, unknown>` if you want a type meaning "any plain object".',
								'- Use `Record<string, never>` if you want a type meaning "any empty plain object".',
								'- Use `unknown` if you want a type meaning "any value".',
								'- Use `NonNullable<unknown>` if you actually want a type meaning "any non-nullable value".'
							].join("\n")
						}
					}
				}
			],
			"@typescript-eslint/require-array-sort-compare": [
				"error",
				{ ignoreStringArrays: true }
			],
			"@typescript-eslint/consistent-type-exports": [
				"error",
				{ fixMixedExportsWithInlineTypeSpecifier: false }
			],
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{
					prefer: "type-imports",
					disallowTypeAnnotations: true,
					fixStyle: "separate-type-imports"
				}
			],
			"@typescript-eslint/no-base-to-string": [
				"error",
				{
					ignoredTypeNames: [
						"Error",
						"RegExp",
						"URL",
						"URLSearchParams",
						"RawData",
						"Buffer"
					]
				}
			],
			"@typescript-eslint/member-ordering": [
				"error",
				{
					default: [
						"signature",
						"field",
						"public-field",
						"constructor",
						"method",
						"public-method"
					]
				}
			],
			"@typescript-eslint/naming-convention": [
				"error",
				{
					selector: "default",
					format: ["camelCase"]
				},
				{
					selector: "variable",
					modifiers: ["const"],
					format: ["camelCase", "PascalCase", "UPPER_CASE"]
				},
				{
					selector: "variable",
					types: ["function"],
					format: ["camelCase", "PascalCase"]
				},
				{
					selector: "parameter",
					format: ["camelCase", "UPPER_CASE"]
				},
				{
					selector: "parameter",
					types: ["function"],
					format: ["camelCase", "PascalCase"]
				},
				{
					selector: "memberLike",
					modifiers: ["readonly"],
					format: ["camelCase", "UPPER_CASE"]
				},
				{
					selector: "typeLike",
					format: ["PascalCase"],
					custom: { regex: "^I[A-Z]", match: false }
				},
				{
					selector: "objectLiteralProperty",
					format: null
				}
			],
			"@typescript-eslint/lines-around-comment": [
				"error",
				{
					allowEnumStart: true,
					allowInterfaceStart: true,
					allowModuleEnd: true,
					allowTypeStart: true,
					allowClassStart: true,
					allowObjectStart: true,
					allowArrayStart: true,
					allowBlockStart: true,
					beforeBlockComment: true,
					beforeLineComment: false
				}
			],
			"import/no-deprecated": "error",
			"import/no-named-default": "error",
			"import/no-duplicates": "error",
			"import/no-useless-path-segments": "error",
			"import/no-unused-modules": "error",
			"import/no-mutable-exports": "error",
			"import/no-empty-named-blocks": "error",
			"import/no-unresolved": "error",
			"import/no-absolute-path": "error",
			"import/no-self-import": "error",
			"import/no-cycle": ["error", { ignoreExternal: true }],
			"import/no-import-module-exports": "error",
			"import/no-amd": "error",
			"import/unambiguous": sourceType === "module" ? "error" : "off",
			"import/no-commonjs": sourceType === "module" ? "error" : "off",
			"import/consistent-type-specifier-style": ["error", "prefer-top-level"],
			"import/no-unassigned-import": [
				"error",
				{
					allow: ["tsconfig-paths/register", "@libs/config/tailwind/globals.scss"]
				}
			],
			"import/no-extraneous-dependencies": [
				"error",
				{
					packageDir: [WORKSPACE_ROOT_DIR],
					devDependencies: [
						"**/*.global.d.ts",
						"**/.eslintrc.cjs",
						"**/jest.config.ts",
						"**/prettier.config.cjs",
						"**/webpack.config.ts",
						"**/*.+(test|spec).+(js|cjs|mjs|jsx|ts|cts|mts|tsx)"
					],
					optionalDependencies: false,
					peerDependencies: false,
					bundledDependencies: false
				}
			],
			"promise/prefer-await-to-then": "warn",
			"promise/prefer-await-to-callbacks": "warn",
			"promise/no-multiple-resolved": "error"
		},

		/*
			Some files need slightly modified rules.
		*/
		overrides: [
			{
				files: ["**/*.spec.*", "**/*.test.*", "**/__test__/**/*"],
				plugins: ["jest"],
				extends: ["plugin:jest/all"],
				rules: {
					"@typescript-eslint/init-declarations": "off",
					"unicorn/consistent-function-scoping": "off",
					"jest/no-hooks": "off",
					"jest/require-top-level-describe": "off",
					"jest/no-conditional-in-test": "warn",
					"jest/prefer-todo": "warn",
					"jest/require-to-throw-message": "warn",
					"jest/prefer-strict-equal": "warn",
					"jest/prefer-expect-assertions": [
						"warn",
						{
							onlyFunctionsWithAsyncKeyword: true,
							onlyFunctionsWithExpectInLoop: true,
							onlyFunctionsWithExpectInCallback: true
						}
					],
					"jest/prefer-lowercase-title": [
						"error",
						{
							ignoreTopLevelDescribe: true,
							allowedPrefixes: ["GET", "POST", "DELETE", "PATCH", "PUT"]
						}
					],
					"jest/no-duplicate-hooks": "error",
					"jest/max-nested-describe": ["error", { max: 2 }],
					"jest/max-expects": ["error", { max: 10 }],
					"jest/consistent-test-it": ["error", { fn: "it", withinDescribe: "it" }]
				}
			},
			{
				files: ["webpack.config.ts", "jest.config.ts"],

				rules: {
					"unicorn/prefer-module": "off",
					"@typescript-eslint/no-var-requires": "off",
					"@typescript-eslint/no-require-imports": "off"
				}
			},
			{
				files: ["*.ts", "*.mts", "*.cts", "*.tsx"],
				rules: {
					"jsdoc/no-types": "error",
					"jsdoc/require-param-type": "off",
					"jsdoc/require-property-type": "off",
					"jsdoc/require-returns-type": "off",
					"jsdoc/require-param": "off",
					"jsdoc/require-property": "off",
					"jsdoc/require-returns": "off"
				}
			},
			{
				files: ["bin.*"],
				rules: {
					"@typescript-eslint/no-floating-promises": ["error", { ignoreIIFE: true }],
					"import/no-import-module-exports": "off",
					"unicorn/prefer-module": "off",
					"unicorn/prefer-top-level-await": "off"
				}
			}
		]
	};
}

const tsModuleConfig = createTypeScriptConfig({ sourceType: "module" });
const tsScriptConfig = createTypeScriptConfig({ sourceType: "script" });

/**
 * @satisfies {import("eslint").ESLint.ConfigData}
 */
const config = {
	root: true,
	settings: {},
	overrides: [
		{
			files: ["*.mjs", "*.jsx", "*.ts", "*.mts", "*.tsx"],
			...tsModuleConfig
		},
		{
			files: ["*.js", "*.cjs", "*.cts"],
			...tsScriptConfig
		},
		{
			files: ["*.global.d.ts"],
			...tsModuleConfig,
			rules: {
				...tsModuleConfig.rules,
				"import/unambiguous": "off",
				"@typescript-eslint/consistent-type-definitions": "off"
			}
		}
	]
};

module.exports = config;
