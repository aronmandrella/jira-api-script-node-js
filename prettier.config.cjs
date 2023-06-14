"use strict";

/** @type {import("prettier").Config & Record<string, number | string | boolean | string[]>} */
const config = {
	plugins: [require.resolve("@trivago/prettier-plugin-sort-imports")],
	endOfLine: "crlf",
	trailingComma: "none",
	useTabs: true,
	printWidth: 90,
	singleAttributePerLine: true,
	semi: true,
	singleQuote: false,
	quoteProps: "consistent",
	importOrder: [
		"tsconfig-paths/register",
		"^node:(.*)$",
		"<THIRD_PARTY_MODULES>",
		"^[./]"
	],
	importOrderSeparation: false,
	importOrderSortSpecifiers: true,
	importOrderGroupNamespaceSpecifiers: true
};

module.exports = config;
