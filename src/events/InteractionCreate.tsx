import { djsx } from "discord-jsx-renderer";
import { Events, MessageFlags } from "discord.js";
import { commands } from "../commands";
import { defineEvent } from "../core/event";
import { ErrClass } from "../core/err";

export default defineEvent({
	name: Events.InteractionCreate,
	handler: async (interaction) => {
		djsx.dispatchInteraction(interaction);

		if (interaction.isChatInputCommand()) {
			const command = commands.find(cmd => cmd.name === interaction.commandName);

			if (!command) return void interaction.reply({
				content: "Command not found. Please report this.",
			});

			try {
				await command.execute(interaction);
			} catch (obj) {
				if (obj instanceof ErrClass) {
					if (interaction.replied || interaction.deferred) {
						interaction.followUp({
							content: obj.payload,
							flags: [MessageFlags.Ephemeral],
						});
					} else {
						interaction.reply({
							content: obj.payload,
							flags: [MessageFlags.Ephemeral],
						});
					};
				} else {
					console.error(`Error executing command ${command.name}:`, obj);
					interaction.reply({
						content: `Error! Please report: ${obj}`,
					});
				}
			}
		}
	},
});

