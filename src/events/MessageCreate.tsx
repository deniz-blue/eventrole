import { ChannelType, Events } from "discord.js";
import { defineEvent } from "../core/event";
import { logger } from "../util/logger";
import { useGuildDataStore } from "../database/store";

export default defineEvent({
	name: Events.MessageCreate,
	async handler(message) {
		if (message.author.bot) return;
		if (message.mentions.roles.size === 0) return;
		if (!message.guild) return;
		if (!message.channel || (
			message.channel.type !== ChannelType.PublicThread &&
			message.channel.type !== ChannelType.PrivateThread
		)) return;

		const eventThread = useGuildDataStore.getState().getEventThread(message.guild.id, message.channel.id);
		if (!eventThread) return logger.trace(`MENTION MESSAGE=${message.id} THREAD=${message.channel.id} NOT_EVENT_THREAD`);

		if (message.mentions.roles.has(eventThread.roleId)) {
			await message.pin(`Pinned because it mentions the event role.`);
			logger.info(`MENTION MESSAGE=${message.id} THREAD=${message.channel.id} PINNED`);
			return;
		}

		logger.info(`MENTION MESSAGE=${message.id} THREAD=${message.channel.id} IGNORED_NOT_MENTIONING_EVENT_ROLE`);
	},
});
