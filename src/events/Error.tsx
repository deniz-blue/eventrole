import { Events } from "discord.js";
import { defineEvent } from "../core/event";
import { logger } from "../util/logger";

export default defineEvent({
	name: Events.Error,
	async handler(error) {
		logger.error(error, "An error occurred in the client.");
	},
});
