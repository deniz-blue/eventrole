import type { ClientEvents } from "discord.js";
import { db } from "../database/db";

export const onThreadUpdate: (...a: ClientEvents["threadUpdate"]) => Promise<void> = async (oldThread, newThread) => {
	// Delete role if thread is archived
	if (!oldThread.archived && newThread.archived) {
		// Fetch guild data
		const guildData = await db.getGuildData(newThread.guild.id);
		const eventThreadData = guildData.eventThreads[newThread.id];
		if (!eventThreadData) {
			return;
		}
		// Fetch role
		const role = newThread.guild.roles.cache.get(eventThreadData.roleId);
		if (role) {
			// Delete role
			await role.delete(`Deleting event role for archived thread ${newThread.id}`);
		}
		// Remove from database
		delete guildData.eventThreads[newThread.id];
		await db.setGuildData(newThread.guild.id, guildData);

		return;
	}

	// Rename role if thread name changed
	if (oldThread.name !== newThread.name) {
		// Fetch guild data
		const guildData = await db.getGuildData(newThread.guild.id);
		const eventThreadData = guildData.eventThreads[newThread.id];
		if (!eventThreadData) {
			return;
		}
		// Fetch role
		const role = newThread.guild.roles.cache.get(eventThreadData.roleId);
		if (role) {
			// Rename role
			await role.setName(`Event: ${newThread.name}`, `Renaming event role for thread ${newThread.id} due to thread name change`);
		}
	}
};
