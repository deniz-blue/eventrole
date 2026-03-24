import { defineCommand } from "../core/command";
import { djsx } from "discord-jsx-renderer";

export default defineCommand({
	type: "slash",
	name: "help",
	description: {
		en: "Show manual for using the bot",
	},
	async execute(interaction) {
		djsx.createMessage(
			interaction,
			<message ephemeral>
				<button
					url="https://github.com/deniz-blue/eventrole#instructions"
				>
					View Manual
				</button>
			</message>
		);
	},
});
