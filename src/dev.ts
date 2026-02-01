import { createServer, createServerModuleRunner } from "vite";
import react from "@vitejs/plugin-react";
import ReactRefreshPlugin from "react-refresh/babel";

async function run() {
	const vite = await createServer({
		server: { middlewareMode: true },
		appType: "custom",
		environments: {
			node: {
				keepProcessEnv: true,
				plugins: [
					...react({
						babel: {
							plugins: [[ReactRefreshPlugin, {
								skipEnvCheck: true,
							} as ReactRefreshPlugin.Options]],
						},
					}),
				],
				consumer: "server",
				dev: {
					preTransformRequests: true,
				},
			},
		},
	});

	const environment = vite.environments.node!;

	const runner = createServerModuleRunner(environment, {});

	runner.import(new URL("./index.ts", import.meta.url).href);
}

run();
