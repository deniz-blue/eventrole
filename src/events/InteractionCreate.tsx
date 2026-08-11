import { djsx } from "discord-jsx-renderer";
import { Events, MessageFlags } from "discord.js";
import { commands } from "../commands";
import { defineEvent } from "../core/event";
import { ErrClass } from "../core/err";
import { logger } from "../util/logger";

export default defineEvent({
	name: Events.InteractionCreate,
	handler: async (interaction) => {
		logger.trace(`Received interaction: ${interaction.type} in guild ${interaction.guildId}`);
		djsx.dispatchInteraction(interaction);

		if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
			const command = commands.find((cmd) => cmd.name === interaction.commandName);

			if (!command) {
				logger.error(`No command found for ${interaction.commandName}`);
				await interaction.reply({
					content: "Command not found. Please report this.",
				});
				return;
			}

			try {
				logger.trace(
					`Executing command ${command.name} for interaction in guild ${interaction.guildId} by user ${interaction.user.id}`,
				);
				await command.execute(interaction as any);
				logger.trace(
					`Finished executing command ${command.name} for interaction in guild ${interaction.guildId} by user ${interaction.user.id}`,
				);
			} catch (obj) {
				if (obj instanceof ErrClass) {
					logger.warn(obj, "Replying with custom error message");
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
					}
				} else {
					logger.error(obj, "Error executing command");
					interaction.reply({
						content: `Error! Please report: ${obj}`,
					});
				}
			}
		}
	},
});
