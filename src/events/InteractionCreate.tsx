import { djsx } from "discord-jsx-renderer";
import type { ClientEvents } from "discord.js";
import { getCommands } from "../commands";

const commands = await getCommands();

export const onInteractionCreate: (...a: ClientEvents["interactionCreate"]) => Promise<void> = async (interaction) => {
	djsx.dispatchInteraction(interaction);

	if (interaction.isChatInputCommand()) {
		const command = commands.find(cmd => cmd.name === interaction.commandName);
		if (command) {
			await command.execute(interaction);
		} else {
			console.warn(`No command found for ${interaction.commandName}`);
		}
	}
};
