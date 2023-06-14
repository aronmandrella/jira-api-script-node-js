import path from "node:path";
import type * as swc from "@swc/core";
import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
import NodemonPlugin from "nodemon-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import type { Configuration as WebpackConfiguration } from "webpack";
import { BannerPlugin } from "webpack";
import NodeExternals from "webpack-node-externals";

type WebpackConfigurationMode = NonNullable<WebpackConfiguration["mode"]>;

type WebpackConfigurationExtended = WebpackConfiguration & {
	output?: WebpackConfiguration["output"] & {
		devtoolModuleFilenameTemplate?: (info: {
			identifier: string;
			shortIdentifier: string;
			resource: string;
			resourcePath: string;
			absoluteResourcePath: string;
			loaders: string;
			allLoaders: string;
			query: string;
			hash: string;
			namespace: string;
		}) => string;
	};
};

type WebpackConfigurationFactory = (
	environment: Record<string, unknown>,
	argv: {
		watch?: boolean;
		mode?: WebpackConfigurationMode;
	}
) => WebpackConfigurationExtended | Promise<WebpackConfigurationExtended>;

type WebpackConfigFileExport =
	| WebpackConfigurationExtended
	| WebpackConfigurationFactory
	| (WebpackConfigurationExtended | WebpackConfigurationFactory)[];

const PROJECT_ROOT_DIR = path.resolve(__dirname);
const PROJECT_TSCONFIG = path.resolve(PROJECT_ROOT_DIR, "tsconfig.json");
const PROJECT_SRC_DIR = path.resolve(PROJECT_ROOT_DIR, "src");
const PROJECT_DIST_DIR = path.resolve(PROJECT_ROOT_DIR, "dist");

const config: WebpackConfigFileExport = (envs, { mode, watch }) => {
	const isDevelopment = mode === "development";
	const isWatch = watch === true;
	const NODE_ENV = isDevelopment ? "development" : "production";

	return {
		stats: isWatch ? "errors-only" : "normal",
		devtool: isDevelopment ? "source-map" : false,
		context: PROJECT_ROOT_DIR,
		entry: {
			app: path.resolve(PROJECT_SRC_DIR, "app.ts")
		},
		resolve: {
			extensions: [".js", ".cjs", ".mjs", ".jsx", ".ts", ".tsx"],
			plugins: [
				new TsconfigPathsPlugin({
					configFile: PROJECT_TSCONFIG,
					extensions: [".js", ".cjs", ".mjs", ".jsx", ".ts", ".tsx"]
				})
			]
		},

		target: "node16",
		output: {
			path: PROJECT_DIST_DIR,
			filename: "[name].js",
			clean: true,
			library: {
				type: "commonjs"
			},

			/*
        Fixes paths in generated source maps.
      */
			devtoolModuleFilenameTemplate: (info) => {
				return `${info.absoluteResourcePath}`;
			}
		},

		/*
      Excludes built-in modules like `fs` and all installed npm packages from bundling.
    */
		externalsPresets: { node: true },
		externals: [
			NodeExternals({
				modulesDir: "node_modules"
			})
		],

		/*
      Disables mocking of `__dirname`, `__filename`, and `globals` variables.
    */
		node: false,

		module: {
			rules: [
				{
					test: /\.(js|cjs|mjs|jsx|ts|tsx)$/iu,
					exclude: /node_modules/u,
					use: {
						loader: require.resolve("swc-loader"),
						options: {
							swcrc: false,
							module: {
								type: "commonjs"
							},
							jsc: {
								/* Targets Node.js 16 or higher */
								target: "es2021",
								externalHelpers: true,
								parser: {
									syntax: "typescript",
									tsx: true,
									decorators: true,
									dynamicImport: true
								}
							}
						} satisfies swc.Options
					}
				}
			]
		},

		optimization: {
			minimize: !isDevelopment,

			/*
        Enables NODE_ENV value hardcoding.
      */
			nodeEnv: NODE_ENV,

			/*
        Disables unnecessary optimizations.
      */
			checkWasmTypes: false,
			splitChunks: false,
			providedExports: false,
			usedExports: false,

			/*
        Disables generation of `license.txt` files and removes all comments.
      */
			minimizer: [
				new TerserPlugin({
					extractComments: false,
					terserOptions: { format: { comments: false } }
				})
			]
		},

		/*
      Reduces number of watched files, and adds compilation debounce to reduce the CPU usage.
    */
		watchOptions: {
			aggregateTimeout: 20,
			ignored: ["**/.git/**", "**/coverage/**", "**/dist/**", "**/node_modules/**"]
		},
		snapshot: {
			managedPaths: [/^(.+?[/\\]node_modules[/\\])/u]
		},
		experiments: {
			layers: true,
			cacheUnaffected: true
		},

		plugins: [
			new CaseSensitivePathsPlugin(),

			/*
        Watch mode support.
      */
			new NodemonPlugin({
				cwd: PROJECT_ROOT_DIR,
				script: path.resolve(PROJECT_DIST_DIR, "app.js"),
				watch: [path.resolve(PROJECT_DIST_DIR, "app.js")]
			}),

			/*
        Adds source maps support.
      */
			new BannerPlugin({
				raw: true,
				entryOnly: true,
				include: /.(js|cjs|mjs)$/u,
				banner: [
					"(()=>{",
					"try{require('source-map-support').install()}",
					`catch(e){console.warn(\`Failed to load source maps :(\n\${e&&e.message}\`)}`,
					"})();"
				].join("")
			}),

			/*
        Adds runtime support for NODE_ENV value.
      */
			new BannerPlugin({
				raw: true,
				entryOnly: true,
				include: /.(js|cjs|mjs)$/u,
				banner: [
					"(()=>{",
					`try{process.env.NODE_ENV=${JSON.stringify(NODE_ENV)}}`,
					`catch(e){console.warn(\`Failed to set NODE_ENV to ${JSON.stringify(
						NODE_ENV
					)} :(\n\${e&&e.message}\`)}`,
					"})();"
				].join("")
			})
		].filter(Boolean)
	};
};

export default config;
