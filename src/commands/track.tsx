import { MessageFlags } from "discord.js";
import { defineCommand } from "../core/command";
import { createRoleForThread } from "../events/ThreadCreate";
import { err } from "../core/err";
import { canManageGuild } from "../logic/checks";
import { useGuildDataStore } from "../database/store";

export default defineCommand({
	name: "track",
	type: "slash",
	description: {
		en: "Manually add existing forum post as an event",
	},
	execute: async (interaction) => {
		if (!interaction.guild) throw err("❌ This command can only be used in a server.");
		if (!canManageGuild(interaction)) throw err("❌ You are not allowed to use this command.");
		if (!interaction.channel?.isThread())
			throw err("❌ This command can only be used in a thread.");

		const eventChannel = useGuildDataStore
			.getState()
			.getEventChannel(interaction.guild.id, interaction.channel.parentId!);
		if (!eventChannel)
			throw err(
				"❌ The parent channel of this thread is not registered as an event channel. Please register the parent channel first.",
			);

		if (useGuildDataStore.getState().getEventThread(interaction.guild.id, interaction.channelId))
			throw err("❌ This thread is already being tracked as an event.");

		await interaction.reply({
			content: "⌛ Manually tracking this thread as an event...",
			flags: [MessageFlags.Ephemeral],
		});

		await createRoleForThread(interaction.channel);

		await interaction.editReply({
			content: "✅ This thread is now being tracked as an event.",
		});
	},
});
