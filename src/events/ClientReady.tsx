import { Events } from "discord.js";
import { defineEvent } from "../core/event";
import { useGuildDataStore } from "../database/store";

export default defineEvent({
	name: Events.ClientReady,
	async handler(client) {
		console.log(`Logged in as ${client.user.tag}!`);

		// Fetch all event threads to cache them so we get reaction events (???)
		const guilds = client.guilds.cache.values();
		for (const guild of guilds) {
			const guildData = useGuildDataStore.getState().guilds[guild.id];
			if (!guildData) continue;
			for (const threadId of Object.keys(guildData.eventThreads)) {
				const thread = await guild.channels.fetch(threadId);
				if (thread?.isThread()) {
					await thread.messages.fetch(thread.id);
					console.log(`Cached event thread ${thread.id} in guild ${guild.id}`);
				}
			}
		}

		await client.application.fetch();
	},
});
