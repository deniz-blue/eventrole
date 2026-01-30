import { userMention, type ClientEvents } from "discord.js";
import { db } from "../database/db";
import { tryCatch } from "../util/trynull";

export const onMessageReactionRemove: (...a: ClientEvents["messageReactionRemove"]) => Promise<void> = async (reaction, user) => {
	// Check if the reaction is in a event thread
	const thread = reaction.message.channel;
	if (!thread.isThread()) {
		return;
	}
	// Fetch guild data
	const guildData = await db.getGuildData(thread.guild.id);
	const eventThreadData = guildData.eventThreads[thread.id];
	if (!eventThreadData) {
		return;
	}
	// Remove the role from the user
	const member = await thread.guild.members.fetch(user.id);
	if (member) {
		const [_, roleRemoveError] = await tryCatch(member.roles.remove(eventThreadData.roleId, `Removed event role for removing reaction from thread ${thread.id}`));
		if (roleRemoveError) {
			console.error(`Failed to remove role from member ${member.id} for removing reaction from thread ${thread.id}:`, roleRemoveError);
			// Show error message
			thread.send("-# ❌ An error occurred while removing " + userMention(user.id) + " the event role. Please contact an administrator. " + roleRemoveError);
		}
	}
};
