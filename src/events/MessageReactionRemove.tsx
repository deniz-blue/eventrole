import { Events } from "discord.js";
import { tryCatch } from "../util/trynull";
import { defineEvent } from "../core/event";
import { isStarterThreadMessage } from "../logic/checks";
import { logger } from "../util/logger";
import { handleRoleAssignment } from "../logic/role-assignment";

export default defineEvent({
	name: Events.MessageReactionRemove,
	handler: async (reaction, user) => {
		if (reaction.partial) {
			const [_, fetchError] = await tryCatch(reaction.fetch());
			if (fetchError) {
				logger.error(fetchError, `Failed to fetch partial reaction for message ${reaction.message.id} in channel ${reaction.message.channelId}:`);
				return;
			}
			logger.trace(`Fetched partial reaction for message ${reaction.message.id} in channel ${reaction.message.channelId}.`);
		}

		const thread = reaction.message.channel;

		logger.trace(`MessageReactionRemove user ${user.id} on message ${reaction.message.id} in channel ${reaction.message.channelId}.`);

		if (!thread.isThread()) return logger.trace(`Channel ${thread.id} is not a thread, ignoring reaction removal.`);
		if (!isStarterThreadMessage(reaction.message)) return logger.trace(`Message ${reaction.message.id} in thread ${thread.id} is not a starter message, ignoring reaction removal.`);

		handleRoleAssignment("remove", thread, user);
	},
});
