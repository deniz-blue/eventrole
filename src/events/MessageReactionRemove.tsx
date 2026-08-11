import { Events } from "discord.js";
import { tryCatch } from "../util/trynull";
import { defineEvent } from "../core/event";
import { isStarterThreadMessage } from "../logic/checks";
import { logger } from "../util/logger";
import { handleRoleAssignment } from "../logic/role-assignment";

export default defineEvent({
	name: Events.MessageReactionRemove,
	handler: async (reaction, user) => {
		const tracePreamble = `MESSAGE=${reaction.message.id} CHANNEL=${reaction.message.channelId} USER=${user.id} REACT=${reaction.emoji.name}`;

		if (reaction.partial) {
			const [_, fetchError] = await tryCatch(reaction.fetch());
			if (fetchError) {
				logger.error(fetchError, `${tracePreamble} PARTIAL_FETCH_ERROR`);
				return;
			}
			logger.trace(`${tracePreamble} PARTIAL_FETCH_SUCCESS`);
		} else {
			logger.trace(`${tracePreamble} EVENT_RECEIVED`);
		}

		const thread = reaction.message.channel;

		if (!thread.isThread()) return logger.trace(`${tracePreamble} NOT_THREAD`);
		if (!isStarterThreadMessage(reaction.message))
			return logger.trace(`${tracePreamble} NOT_STARTER_MESSAGE`);

		handleRoleAssignment("remove", thread, user);
	},
});
