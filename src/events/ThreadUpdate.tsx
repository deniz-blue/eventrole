import { Events, type AnyThreadChannel } from "discord.js";
import { defineEvent } from "../core/event";
import { useGuildDataStore } from "../database/store";

export default defineEvent({
	name: Events.ThreadUpdate,
	handler: async (oldThread, newThread) => {
		// Archived
		if (!oldThread.archived && newThread.archived) return await cleanupEventThread(newThread);

		// Rename role
		if (oldThread.name !== newThread.name) {
			const eventThread = useGuildDataStore.getState().getEventThread(newThread.guild.id, newThread.id);
			if (!eventThread) return;

			const role = newThread.guild.roles.cache.get(eventThread.roleId);
			if (role)
				await role.setName(`Event: ${newThread.name}`, `Renaming event role for thread ${newThread.id} due to thread name change`);
		}
	},
});

export const cleanupEventThread = async (thread: AnyThreadChannel) => {
	const eventThread = useGuildDataStore.getState().getEventThread(thread.guild.id, thread.id);
	if (!eventThread) return;

	const role = thread.guild.roles.cache.get(eventThread.roleId);
	if (role)
		await role.delete(`Deleting event role for archived thread ${thread.id}`);

	useGuildDataStore.setState((draft) => {
		delete draft.guilds[thread.guild.id]!.eventThreads[thread.id];
	});
};
