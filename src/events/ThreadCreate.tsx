import { roleMention, type ClientEvents } from "discord.js";
import { db } from "../database/db";
import { tryCatch } from "../util/trynull";

export const onThreadCreate: (...a: ClientEvents["threadCreate"]) => Promise<void> = async (thread, newlyCreated) => {
	const guildData = await db.getGuildData(thread.guild.id);
	const eventChannelData = guildData.eventChannels[thread.parentId!];

	// If the thread's parent channel is not an event channel, ignore it
	if (!eventChannelData) {
		return;
	}

	// If the thread is not newly created, ignore it
	if (!newlyCreated) {
		return;
	}

	// Create a role for the thread
	const [role, roleCreateError] = await tryCatch(thread.guild.roles.create({
		name: `Event: ${thread.name}`,
		mentionable: true,
		permissions: [],
		reason: `Role for event thread ${thread.id}`,
	}));

	if (roleCreateError || !role) {
		console.error(`Failed to create role for thread ${thread.id}:`, roleCreateError);
		// Show error message
		thread.send("-# ❌ An error occurred while creating the event role. Please contact an administrator. " + roleCreateError);
		return;
	}

	// Store the role ID in the database
	guildData.eventThreads[thread.id] = {
		roleId: role.id,
	};
	await db.setGuildData(thread.guild.id, guildData);

	// Assign the role to the thread creator
	if (thread.ownerId) {
		const member = await thread.guild.members.fetch(thread.ownerId);
		if (member) {
			const [_, roleAddError] = await tryCatch(member.roles.add(role, `Assigned event role for thread ${thread.id}`));
			if (roleAddError) {
				console.error(`Failed to assign role to member ${member.id} for thread ${thread.id}:`, roleAddError);
				// Show error message
				thread.send("-# ❌ An error occurred while assigning you the event role. Please contact an administrator. " + roleAddError);
			}
		}
	}

	// Send informal message in the thread
	thread.send({
		content: `${eventChannelData.mentionRoleIds.map(roleMention).join(" ")}\n-# Role: ${roleMention(role.id)} (react to thread emoji to get the role)`,
	});
};
