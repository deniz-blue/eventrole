import { Events, type AnyThreadChannel } from "discord.js";
import { defineEvent } from "../core/event";
import { useGuildDataStore } from "../database/store";
import { logger } from "../util/logger";

export default defineEvent({
	name: Events.ThreadUpdate,
	handler: async (oldThread, newThread) => {
		// Archived
		if (!oldThread.archived && newThread.archived) return await cleanupEventThread(newThread);

		// Rename role
		if (oldThread.name !== newThread.name) {
			logger.info(`Thread ${newThread.id} renamed from "${oldThread.name}" to "${newThread.name}", checking if role rename is needed.`);

			const eventThread = useGuildDataStore.getState().getEventThread(newThread.guild.id, newThread.id);
			if (!eventThread) return logger.trace(`Thread ${newThread.id} is not an event thread, skipping role rename.`);

			const role = newThread.guild.roles.cache.get(eventThread.roleId);
			if (role)
				await role.setName(`Event: ${newThread.name}`, `Renaming event role for thread ${newThread.id} due to thread name change`);
		}
	},
});

export const cleanupEventThread = async (thread: AnyThreadChannel) => {
	logger.info(`Thread ${thread.id} archived, cleaning up event thread data and role if exists.`);

	const eventThread = useGuildDataStore.getState().getEventThread(thread.guild.id, thread.id);
	if (!eventThread) return logger.trace(`Thread ${thread.id} is not an event thread, skipping cleanup.`);

	const role = thread.guild.roles.cache.get(eventThread.roleId);
	if (role)
		await role.delete(`Deleting event role for archived thread ${thread.id}`);

	useGuildDataStore.setState((draft) => {
		delete draft.guilds[thread.guild.id]!.eventThreads[thread.id];
	});

	logger.info(`Finished cleaning up event thread data and role for thread ${thread.id}.`);
};
