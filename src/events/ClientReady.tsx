import type { ClientEvents } from "discord.js";
import { db } from "../database/db";

export const onClientReady: (...a: ClientEvents["clientReady"]) => Promise<void> = async (client) => {
	console.log(`Logged in as ${client.user.tag}!`);

	// Fetch all event threads to cache them so we get reaction events (???)
	const guilds = client.guilds.cache.values();
	for (const guild of guilds) {
		const guildData = await db.getGuildData(guild.id);
		for (const threadId of Object.keys(guildData.eventThreads)) {
			const thread = await guild.channels.fetch(threadId);
			if (thread?.isThread()) {
				await thread.messages.fetch(thread.id);
			}
		}
	}
};
