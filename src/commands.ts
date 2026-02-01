import type { Command } from "./core/command";

let commands = import.meta.glob("./commands/**/*.tsx", { eager: true });

console.log(commands);

export const getCommands = () => {
	return Object.values(commands).map((mod: any) => mod.default as Command);
};

if (import.meta.hot) {
	import.meta.hot.accept((newModule) => {
		if (newModule) {
			commands = import.meta.glob("./commands/**/*.tsx", { eager: true });
			console.log("Commands updated dynamically!");
		}
	});
}
