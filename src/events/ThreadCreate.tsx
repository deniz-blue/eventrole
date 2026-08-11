import { Events, roleMention, type AnyThreadChannel } from "discord.js";
import { tryCatch } from "../util/trynull";
import { defineEvent } from "../core/event";
import { useGuildDataStore } from "../database/store";
import { logger } from "../util/logger";

export default defineEvent({
	name: Events.ThreadCreate,
	handler: async (thread, newlyCreated) => {
		if (!newlyCreated)
			return logger.trace(
				`Thread ${thread.id} created but not newly created, skipping role creation.`,
			);

		if (thread.partial) {
			const [_, fetchError] = await tryCatch(thread.fetch() as Promise<AnyThreadChannel>);
			if (fetchError) {
				logger.error(
					fetchError,
					`Failed to fetch partial thread ${thread.id} in guild ${thread.guild.id}:`,
				);
				return;
			}
			logger.trace(`Fetched partial thread ${thread.id} in guild ${thread.guild.id}.`);
		}

		return await createRoleForThread(thread);
	},
});

export const createRoleForThread = async (thread: AnyThreadChannel) => {
	const eventChannel = useGuildDataStore
		.getState()
		.getEventChannel(thread.guild.id, thread.parentId!);
	if (!eventChannel)
		return logger.trace(
			`Thread ${thread.id} created in guild ${thread.guild.id} but no event channel is configured, skipping role creation.`,
		);

	const [role, roleCreateError] = await tryCatch(
		thread.guild.roles.create({
			name: `Event: ${thread.name}`,
			mentionable: true,
			permissions: [],
			reason: `Role for event thread ${thread.id}`,
		}),
	);

	if (roleCreateError || !role) {
		logger.error(roleCreateError, `Failed to create role for thread ${thread.id}:`);
		await thread.send(
			"-# ❌ An error occurred while creating the event role. Please contact an administrator. " +
				roleCreateError,
		);
		return;
	}

	logger.info(`Created role ${role.id} for thread ${thread.id}.`);

	useGuildDataStore.setState((draft) => {
		draft.guilds[thread.guild.id]!.eventThreads[thread.id] = {
			roleId: role.id,
		};
	});

	logger.info(`Created role ${role.id} for thread ${thread.id}`);

	await thread.send({
		content: `${eventChannel.mentionRoleIds.map(roleMention).join(" ")}\n-# Role created: ${roleMention(role.id)}\n-# React with any emoji to the **first message above** to get the role`,
	});

	const firstMessage = await thread.messages.fetch(thread.id);
	if (!firstMessage) {
		logger.error(`Failed to fetch first message of thread ${thread.id} for reaction role setup.`);
		await thread.send("-# ⚠️ Pinning first message failed.");
		return;
	}

	await firstMessage.pin(`my reason is meow`);

	const member = await thread.guild.members.fetch(thread.ownerId);
	const [_, roleAddError] = await tryCatch(
		member.roles.add(role, `Assigned event role for thread ${thread.id}`),
	);
	if (roleAddError) {
		logger.error(
			roleAddError,
			`Failed to assign role to member ${member.id} for thread ${thread.id}:`,
		);
		await thread.send("-# ⚠️ I could not give the role to the event host: " + roleAddError);
		// no return
	} else {
		logger.info(`Assigned role ${role.id} to member ${member.id} for thread ${thread.id}.`);
	}
};
