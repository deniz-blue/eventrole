import { userMention, type ClientEvents } from "discord.js";
import { db } from "../database/db";
import { tryCatch } from "../util/trynull";

export const onMessageReactionAdd: (...a: ClientEvents["messageReactionAdd"]) => Promise<void> = async (reaction, user) => {
	// Check if the reaction is in a event thread
	const thread = reaction.message.channel;
	if (!thread.isThread()) {
		return;
	}

	// Check if reaction is on the start message of the thread
	if (reaction.message.id !== thread.id) {
		return;
	}

	// Fetch guild data
	const guildData = await db.getGuildData(thread.guild.id);
	const eventThreadData = guildData.eventThreads[thread.id];
	if (!eventThreadData) {
		return;
	}
	
	// Assign the role to the user
	const member = await thread.guild.members.fetch(user.id);
	if (member) {
		const [_, roleAddError] = await tryCatch(member.roles.add(eventThreadData.roleId, `Assigned event role for reacting to thread ${thread.id}`));
		if (roleAddError) {
			console.error(`Failed to assign role to member ${member.id} for reacting to thread ${thread.id}:`, roleAddError);
			// Show error message
			thread.send("-# ❌ An error occurred while assigning " + userMention(user.id) + " the event role. Please contact an administrator. " + roleAddError);
		}
	}
};
