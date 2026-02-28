import { Events } from "discord.js";
import { defineEvent } from "../core/event";
import { tryCatch } from "../util/trynull";
import { logger } from "../util/logger";

const REACTION_PIN = ["📌", "📍"];
const REACTION_UNPIN = ["🗑️"];

export default defineEvent({
	name: Events.MessageReactionAdd,
	handler: async (reaction, user) => {
		if (reaction.partial) {
			const [_, fetchError] = await tryCatch(reaction.fetch());
			if (fetchError)
				return logger.error(fetchError, `Failed to fetch partial reaction for message ${reaction.message.id} in channel ${reaction.message.channelId}:`);
			logger.trace(`Fetched partial reaction for message ${reaction.message.id} in channel ${reaction.message.channelId}.`);
		}

		if (!reaction.message.channel.isThread()) return;
		if (!reaction.emoji.name) return;

		if (![...REACTION_PIN, ...REACTION_UNPIN].includes(reaction.emoji.name)) return;

		const isPin = REACTION_PIN.includes(reaction.emoji.name);

		if (reaction.message.channel.ownerId !== user.id) {
			logger.warn(`User ${user.id} attempted to ${isPin ? "pin" : "unpin"} message ${reaction.message.id} in thread ${reaction.message.channelId} without being the thread owner.`);
			return;
		}

		const [_, error] = await tryCatch(isPin ? reaction.message.pin() : reaction.message.unpin());
		if (error) {
			logger.error(error, `Failed to ${isPin ? "pin" : "unpin"} message ${reaction.message.id} in thread ${reaction.message.channelId}:`);
			return;
		}

		logger.info(`${isPin ? "Pinned" : "Unpinned"} message ${reaction.message.id} in thread ${reaction.message.channelId} by user ${user.id}.`);
	},
});
