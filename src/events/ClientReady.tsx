import { Events } from "discord.js";
import { defineEvent } from "../core/event";
import { logger } from "../util/logger";

export default defineEvent({
	name: Events.ClientReady,
	async handler(client) {
		logger.info(`Logged in as ${client.user.tag}!`);

		await client.application.fetch();
		logger.trace(`Application ID: ${client.application.id}`);
	},
});
