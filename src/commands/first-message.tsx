import { ChannelType, messageLink } from "discord.js";
import { defineCommand } from "../core/command";
import { err } from "../core/err";

export default defineCommand({
	name: "first-message",
	type: "slash",
	description: {
		en: "Get a link to the first message of the thread",
	},
	execute: async (interaction) => {
		if (!interaction.guild) throw err("❌ This command can only be used in a server.");
		if (!interaction.channel || (
			interaction.channel.type !== ChannelType.PublicThread &&
			interaction.channel.type !== ChannelType.PrivateThread
		)) throw err("❌ This command can only be used in a thread channel.");

		await interaction.editReply({
			content: `${messageLink(
				interaction.channelId,
				interaction.channelId,
				interaction.guild.id,
			)}`,
		});
	},
});
