import { createServer, type RunnableDevEnvironment } from "vite";
import react from "@vitejs/plugin-react";

globalThis.window = globalThis as any;

const watching = process.argv.includes("dev");

// Vite opens the HMR websocket on port 24678 and starts a file watcher whether or not
// anything reloads, so a plain run would otherwise fight a watching one for the port.
const server = watching
	? { middlewareMode: true as const }
	: { middlewareMode: true as const, hmr: false as const, ws: false as const, watch: null };

const viteServer = await createServer({
	appType: "custom",
	server,
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
