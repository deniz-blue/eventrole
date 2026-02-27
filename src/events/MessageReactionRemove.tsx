import { Events, userMention } from "discord.js";
import { tryCatch } from "../util/trynull";
import { defineEvent } from "../core/event";
import { isStarterThreadMessage } from "../logic/checks";
import { useGuildDataStore } from "../database/store";
import { logger } from "../util/logger";

export default defineEvent({
	name: Events.MessageReactionRemove,
	handler: async (reaction, user) => {
		const thread = reaction.message.channel;

		logger.trace(`Received reaction remove by user ${user.id} on message ${reaction.message.id} in channel ${reaction.message.channelId}.`);

		if (!thread.isThread()) return logger.trace(`Channel ${thread.id} is not a thread, ignoring reaction removal.`);
		if (!isStarterThreadMessage(reaction.message)) return logger.trace(`Message ${reaction.message.id} in thread ${thread.id} is not a starter message, ignoring reaction removal.`);

		const eventThread = useGuildDataStore.getState().getEventThread(thread.guild.id, thread.id);
		if (!eventThread) return logger.trace(`Thread ${thread.id} is not an event thread, ignoring reaction removal.`);

		const member = await thread.guild.members.fetch(user.id);

		logger.trace(`Removing role ${eventThread.roleId} from member ${member.id} for removing reaction from thread ${thread.id}.`);

		const [_, roleRemoveError] = await tryCatch(member.roles.remove(eventThread.roleId, `Removed event role for removing reaction from thread ${thread.id}`));

		if (roleRemoveError) {
			logger.error(roleRemoveError, `Failed to remove role from member ${member.id} for removing reaction from thread ${thread.id}:`);
			// Show error message
			thread.send("-# ❌ An error occurred while removing " + userMention(user.id) + " the event role. Please contact an administrator. " + roleRemoveError);
			return;
		}

		logger.trace(`Finished attempting to remove role ${eventThread.roleId} from member ${member.id} for removing reaction from thread ${thread.id}.`);
	},
});
