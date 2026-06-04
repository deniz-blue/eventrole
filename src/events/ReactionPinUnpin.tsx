import { Events } from "discord.js";
import { defineEvent } from "../core/event";
import { tryCatch } from "../util/trynull";
import { logger } from "../util/logger";
import { canManagePins } from "../logic/checks";

const REACTION_PIN = ["📌", "📍"];
const REACTION_UNPIN = ["🗑️"];

export default defineEvent({
	name: Events.MessageReactionAdd,
	handler: async (reaction, user) => {
		const tracePreamble = `MESSAGE=${reaction.message.id} CHANNEL=${reaction.message.channelId} USER=${user.id} REACT=${reaction.emoji.name}`;

		if (reaction.partial) {
			const [_, fetchError] = await tryCatch(reaction.fetch());
			if (fetchError)
				return logger.error(fetchError, `${tracePreamble} PARTIAL_FETCH_ERROR`);
			logger.trace(`${tracePreamble} PARTIAL_FETCH_SUCCESS`);
		}

		if (!reaction.message.channel.isThread()) return;
		if (!reaction.emoji.name) return;

		if (![...REACTION_PIN, ...REACTION_UNPIN].includes(reaction.emoji.name)) return;

		const isPin = REACTION_PIN.includes(reaction.emoji.name);

		if (isPin && reaction.message.pinned)
			return logger.trace(`${tracePreamble} IGNORE_ALREADY_${isPin ? "PINNED" : "UNPINNED"}`);

		if (!canManagePins({
			channel: reaction.message.channel,
			user,
			client: reaction.message.client,
		})) {
			logger.warn(`${tracePreamble} FAILED_PERMISSION_CHECK`);
			return;
		}

		const [_, error] = await tryCatch(isPin ? reaction.message.pin() : reaction.message.unpin());
		if (error) {
			logger.error(error, `${tracePreamble} ${isPin ? "PIN" : "UNPIN"}_ERROR`);
			return;
		}

		logger.info(`${tracePreamble} ${isPin ? "PINNED" : "UNPINNED"}`);
	},
});
