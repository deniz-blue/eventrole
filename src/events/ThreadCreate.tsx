import { Events, messageLink, roleMention, type AnyThreadChannel, type ClientEvents } from "discord.js";
import { tryCatch } from "../util/trynull";
import { defineEvent } from "../core/event";
import { useGuildDataStore } from "../database/store";
import { logger } from "../util/logger";

export default defineEvent({
	name: Events.ThreadCreate,
	handler: async (thread, newlyCreated) => {
		if (!newlyCreated) return logger.trace(`Thread ${thread.id} created but not newly created, skipping role creation.`);

		return await createRoleForThread(thread);
	},
});

export const createRoleForThread = async (
	thread: AnyThreadChannel,
) => {
	const eventChannel = useGuildDataStore.getState().getEventChannel(thread.guild.id, thread.parentId!);
	if (!eventChannel) return logger.trace(`Thread ${thread.id} created in guild ${thread.guild.id} but no event channel is configured, skipping role creation.`);

	const [role, roleCreateError] = await tryCatch(thread.guild.roles.create({
		name: `Event: ${thread.name}`,
		mentionable: true,
		permissions: [],
		reason: `Role for event thread ${thread.id}`,
	}));

	if (roleCreateError || !role) {
		logger.error(roleCreateError, `Failed to create role for thread ${thread.id}:`);
		await thread.send("-# ❌ An error occurred while creating the event role. Please contact an administrator. " + roleCreateError);
		return;
	}

	logger.info(`Created role ${role.id} for thread ${thread.id}.`);

	useGuildDataStore.setState(draft => {
		draft.guilds[thread.guild.id]!.eventThreads[thread.id] = {
			roleId: role.id,
		};
	});

	const member = await thread.guild.members.fetch(thread.ownerId);
	const [_, roleAddError] = await tryCatch(member.roles.add(role, `Assigned event role for thread ${thread.id}`));
	if (roleAddError) {
		logger.error(roleAddError, `Failed to assign role to member ${member.id} for thread ${thread.id}:`);
		await thread.send("-# ❌ An error occurred while assigning you the event role. Please contact an administrator. " + roleAddError);
		// no return
	}

	logger.info(`Created role ${role.id} for thread ${thread.id} and assigned to member ${member.id}.`);

	await thread.send({
		content: `${eventChannel.mentionRoleIds.map(roleMention).join(" ")}\n-# Role: ${roleMention(role.id)} (react to first message (${messageLink(
			thread.guildId,
			thread.id,
			thread.id,
		)}) to get the role)`,
	});
};
