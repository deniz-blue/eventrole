import { Events } from "discord.js";
import { defineEvent } from "../core/event";
import { useGuildDataStore } from "../database/store";
import { logger } from "../util/logger";

export default defineEvent({
	name: Events.ClientReady,
	async handler(client) {
		logger.info(`Logged in as ${client.user.tag}!`);

		// Fetch all event threads to cache them so we get reaction events (???)
		const guilds = client.guilds.cache.values();
		for (const guild of guilds) {
			const guildData = useGuildDataStore.getState().guilds[guild.id];
			if (!guildData) continue;
			for (const threadId of Object.keys(guildData.eventThreads)) {
				const thread = await guild.channels.fetch(threadId);
				if (thread?.isThread()) {
					await thread.messages.fetch(thread.id);
					logger.info(`Cached event thread ${thread.id} in guild ${guild.id}`);
				}
			}
		}

		logger.info("Finished caching event threads");
		await client.application.fetch();
		logger.info(`Application ID: ${client.application.id}`);
	},
});
