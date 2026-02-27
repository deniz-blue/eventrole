import { User, userMention, type AnyThreadChannel, type Message, type PartialUser } from "discord.js";
import { logger } from "../util/logger";
import { useGuildDataStore } from "../database/store";
import { tryCatch } from "../util/trynull";

export const handleRoleAssignment = async (
	action: "add" | "remove",
	thread: AnyThreadChannel,
	user: User | PartialUser,
) => {
	const eventThread = useGuildDataStore.getState().getEventThread(thread.guild.id, thread.id);
	if (!eventThread) return logger.trace(`Thread ${thread.id} is not an event thread, ignoring reaction.`);

	const member = await thread.guild.members.fetch(user.id);

	const [_, err] = await tryCatch(member.roles[action](eventThread.roleId, `${action === "add" ? "Added" : "Removed"} event role for reacting to thread ${thread.id}`));

	if (err) {
		logger.error(err, `Failed to assign role to member ${member.id} for reacting to thread ${thread.id}:`);
		thread.send("-# ❌ An error occurred while assigning " + userMention(user.id) + " the event role. Please contact an administrator. " + err);
		return;
	}

	logger.info(`${action === "add" ? "Added" : "Removed"} role ${eventThread.roleId} to member ${member.id} for reacting to thread ${thread.id}.`);
};
