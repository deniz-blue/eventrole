import { createServer, type RunnableDevEnvironment } from "vite";
import react from "@vitejs/plugin-react";

globalThis.window = globalThis as any;

const PROD =
	process.env.NODE_ENV === "production" ||
	process.env.VITE_MODE === "production" ||
	process.argv.includes("prod");

const viteServer = await createServer({
	appType: "custom",
	server: {
		middlewareMode: true,
	},
	clearScreen: false,
	envPrefix: ["VITE_", "NODE_", "DISCORD_"],
	environments: {
		node: {
			resolve: {
				conditions: ["node"],
			},
			optimizeDeps: {
				disabled: true,
			},
			keepProcessEnv: true,
			consumer: "server",
			build: {
				target: "nodenext",
			},
		},
	},
	plugins: [react()],
});

console.log("Vite server is running.");

const serverEnvironment = viteServer.environments.node! as RunnableDevEnvironment;

const publish = process.argv.includes("publish") || process.argv.includes("pub");

await serverEnvironment.runner.import(publish ? "src/publish.ts" : "src/index.ts");
