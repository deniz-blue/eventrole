import {
	User,
	userMention,
	type AnyThreadChannel,
	type PartialUser,
} from "discord.js";
import { logger } from "../util/logger";
import { useGuildDataStore } from "../database/store";
import { tryCatch } from "../util/trynull";

export const handleRoleAssignment = async (
	action: "add" | "remove",
	thread: AnyThreadChannel,
	user: User | PartialUser,
) => {
	const tracePreamble = `THREAD=${thread.id} USER=${user.id} ACTION=${action}`;

	const eventThread = useGuildDataStore.getState().getEventThread(thread.guild.id, thread.id);
	if (!eventThread) return logger.trace(`${tracePreamble} NOT_EVENT_THREAD`);

	const member = await thread.guild.members.fetch(user.id);

	const [_, err] = await tryCatch(
		member.roles[action](
			eventThread.roleId,
			`${action === "add" ? "Added" : "Removed"} event role for reacting to thread ${thread.id}`,
		),
	);

	if (err) {
		logger.error(err, `${tracePreamble} ROLE_ASSIGNMENT_ERROR`);
		thread.send(
			"-# ❌ An error occurred while assigning " +
				userMention(user.id) +
				" the event role. Please contact an administrator. " +
				err,
		);
		return;
	}

	logger.info(`${tracePreamble} ROLE_ASSIGNMENT_SUCCESS`);
};
