import { Events, roleMention, type AnyThreadChannel, type ClientEvents } from "discord.js";
import { tryCatch } from "../util/trynull";
import { defineEvent } from "../core/event";
import { useGuildDataStore } from "../database/store";

export default defineEvent({
	name: Events.ThreadCreate,
	handler: async (thread, newlyCreated) => {
		if (!newlyCreated) return;

		return await createRoleForThread(thread);
	},
});

export const createRoleForThread = async (
	thread: AnyThreadChannel,
) => {
	const eventChannel = useGuildDataStore.getState().getEventChannel(thread.guild.id, thread.parentId!);
	if (!eventChannel) return;

	const [role, roleCreateError] = await tryCatch(thread.guild.roles.create({
		name: `Event: ${thread.name}`,
		mentionable: true,
		permissions: [],
		reason: `Role for event thread ${thread.id}`,
	}));

	if (roleCreateError || !role) {
		console.error(`Failed to create role for thread ${thread.id}:`, roleCreateError);
		await thread.send("-# ❌ An error occurred while creating the event role. Please contact an administrator. " + roleCreateError);
		return;
	}

	useGuildDataStore.setState(draft => {
		draft.guilds[thread.guild.id]!.eventThreads[thread.id] = {
			roleId: role.id,
		};
	});

	const member = await thread.guild.members.fetch(thread.ownerId);
	const [_, roleAddError] = await tryCatch(member.roles.add(role, `Assigned event role for thread ${thread.id}`));
	if (roleAddError) {
		console.error(`Failed to assign role to member ${member.id} for thread ${thread.id}:`, roleAddError);
		await thread.send("-# ❌ An error occurred while assigning you the event role. Please contact an administrator. " + roleAddError);
		// no return
	}

	await thread.send({
		content: `${eventChannel.mentionRoleIds.map(roleMention).join(" ")}\n-# Role: ${roleMention(role.id)} (react to post emoji to get the role)`,
	});
};
