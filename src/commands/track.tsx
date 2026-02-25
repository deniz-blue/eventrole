import { ChannelType } from "discord.js";
import { command } from "../core/command";
import { createRoleForThread } from "../events/ThreadCreate";
import { db } from "../database/db";

export default command({
	name: "track",
	description: {
		en: "Manually add existing forum post as an event",
	},
	execute: async (interaction) => {
		// Command requires MANAGE_GUILD permission
		if (!interaction.guild || !interaction.memberPermissions?.has("ManageGuild")) {
			interaction.reply({
				content: "You need the Manage Server permission to use this command.",
				ephemeral: true,
			});
			return;
		}

		// Check if the command is used in a thread channel
		if (!interaction.channel || (interaction.channel.type !== ChannelType.PublicThread && interaction.channel.type !== ChannelType.PrivateThread)) {
			interaction.reply({
				content: "This command can only be used in a thread channel.",
				ephemeral: true,
			});
			return;
		}

		const guildData = await db.getGuildData(interaction.guild.id);
		if (!guildData.eventChannels[interaction.channel.parentId!]) {
			interaction.reply({
				content: "The parent channel of this thread is not registered as an event channel. Please register the parent channel first.",
				ephemeral: true,
			});
			return;
		}

		await interaction.reply({
			content: "Manually tracking this thread as an event...",
			ephemeral: true,
		});

		await createRoleForThread(interaction.channel);

		await interaction.editReply({
			content: "This thread is now being tracked as an event.",
		});
	},
});
