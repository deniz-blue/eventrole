import type { Command } from "./core/command";

export let commands: Command[] = Object.values(
	import.meta.glob("./commands/**/*.*", { eager: true }),
).map((loader) => (loader as any).default as Command);

console.log(
	"Loaded commands: ",
	commands.map((c) => c.name),
);

if (import.meta.hot) {
	import.meta.hot.accept((newModule) => {
		if (!newModule) return console.error("Failed to load new module for commands");
		commands = (newModule as any).commands;
		console.log("Commands reloaded");
	});
}
