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

		logger.info(`Message ${message.id} in thread ${message.channel.id} mentions roles: ${message.mentions.roles.map(r => r.id).join(", ")}`);

		const eventThread = useGuildDataStore.getState().getEventThread(message.guild.id, message.channel.id);
		if (!eventThread) return logger.trace(`Message ${message.id} in thread ${message.channel.id} mentions roles but the thread is not registered as an event thread, skipping.`);

		if (message.mentions.roles.has(eventThread.roleId)) {
			logger.info(`Message ${message.id} in thread ${message.channel.id} mentions the event role, pinning the message.`);
			await message.pin(`Pinned because it mentions the event role.`);
			return;
		}

		logger.info(`Message ${message.id} in thread ${message.channel.id} mentions roles but does not mention the event role, skipping pinning.`);
	},
});
