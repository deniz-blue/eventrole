import { ChannelType, MessageFlags } from "discord.js";
import { defineCommand } from "../core/command";
import { err } from "../core/err";
import { isAllowedToManage } from "../logic/checks";
import { useGuildDataStore } from "../database/store";
import { logger } from "../util/logger";
import { tryCatch } from "../util/trynull";

export default defineCommand({
	name: "resync",
	type: "slash",
	description: {
		en: "Assign the event role to reacted users in case not synced properly",
	},
	execute: async (interaction) => {
		if (!interaction.guild) throw err("❌ This command can only be used in a server.");
		if (!isAllowedToManage(interaction)) throw err("❌ You are not allowed to use this command.");
		if (
			!interaction.channel ||
			(interaction.channel.type !== ChannelType.PublicThread &&
				interaction.channel.type !== ChannelType.PrivateThread)
		)
			throw err("❌ This command can only be used in a thread channel.");

		const eventChannel = useGuildDataStore
			.getState()
			.getEventChannel(interaction.guild.id, interaction.channel.parentId!);
		if (!eventChannel)
			throw err(
				"❌ The parent channel of this thread is not registered as an event channel. Please register the parent channel first.",
			);

		const eventThread = useGuildDataStore
			.getState()
			.getEventThread(interaction.guild.id, interaction.channelId);
		if (!eventThread) throw err("❌ This thread is not registered as an event thread.");

		const firstMessage = await interaction.channel.messages.fetch(interaction.channelId);
		if (!firstMessage) throw err("❌ Failed to fetch the first message of this thread.");

		const role = interaction.guild.roles.cache.get(eventThread.roleId);
		if (!role) throw err("❌ The event role for this thread does not exist.");

		await interaction.reply({
			content: "⌛ Resyncing roles based on reactions...",
			flags: [MessageFlags.Ephemeral],
		});

		const reactions = firstMessage.reactions.cache;
		const allUserIds = new Set<string>();

		for (const reaction of reactions.values()) {
			const users = await reaction.users.fetch();
			users.forEach((user) => allUserIds.add(user.id));
		}

		const guildMembers = await interaction.guild.members.fetch({ user: [...allUserIds] });
		const membersToAddRole = guildMembers.filter((member) => !member.roles.cache.has(role.id));
		const errors = [];

		for (const member of membersToAddRole.values()) {
			const [_, roleAddError] = await tryCatch(
				member.roles.add(role, `Resyncing event role for thread ${interaction.channelId}`),
			);
			if (roleAddError) {
				logger.error(
					roleAddError,
					`Failed to assign role to member ${member.id} during resync for thread ${interaction.channelId}:`,
				);
				errors.push(roleAddError);
			} else {
				logger.info(
					`Assigned role ${role.id} to member ${member.id} during resync for thread ${interaction.channelId}.`,
				);
			}
		}

		const errorAmount = errors.length;
		const assignedAmount = membersToAddRole.size - errorAmount;
		const untouchedAmount = allUserIds.size - membersToAddRole.size;

		await interaction.editReply({
			content: `✅ Resync complete! Assigned role to ${assignedAmount} members, ${untouchedAmount} members were already in sync, ${errorAmount} errors occurred.\n${errors.length > 0 ? "Errors:\n- " + errors.map((e) => "" + e).join("\n- ") : ""}`,
		});
	},
});
