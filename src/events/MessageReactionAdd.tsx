import { Events, userMention } from "discord.js";
import { tryCatch } from "../util/trynull";
import { defineEvent } from "../core/event";
import { useGuildDataStore } from "../database/store";
import { isStarterThreadMessage } from "../logic/checks";
import { logger } from "../util/logger";

export default defineEvent({
	name: Events.MessageReactionAdd,
	handler: async (reaction, user) => {
		const thread = reaction.message.channel;

		if (!thread.isThread()) return logger.trace(`Channel ${thread.id} is not a thread, ignoring reaction.`);
		if (!isStarterThreadMessage(reaction.message)) return logger.trace(`Message ${reaction.message.id} in thread ${thread.id} is not a starter message, ignoring reaction.`);

		const eventThread = useGuildDataStore.getState().getEventThread(thread.guild.id, thread.id);
		if (!eventThread) return;

		const member = await thread.guild.members.fetch(user.id);

		const [_, roleAddError] = await tryCatch(member.roles.add(eventThread.roleId, `Assigned event role for reacting to thread ${thread.id}`));

		if (roleAddError) {
			logger.error(roleAddError, `Failed to assign role to member ${member.id} for reacting to thread ${thread.id}:`);
			thread.send("-# ❌ An error occurred while assigning " + userMention(user.id) + " the event role. Please contact an administrator. " + roleAddError);
		}
	},
});
