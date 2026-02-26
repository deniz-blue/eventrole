import { Events, userMention } from "discord.js";
import { tryCatch } from "../util/trynull";
import { defineEvent } from "../core/event";
import { useGuildDataStore } from "../database/store";
import { isStarterThreadMessage } from "../logic/checks";

export default defineEvent({
	name: Events.MessageReactionAdd,
	handler: async (reaction, user) => {
		const thread = reaction.message.channel;

		if (!thread.isThread()) return;
		if (!isStarterThreadMessage(reaction.message)) return;

		const eventThread = useGuildDataStore.getState().getEventThread(thread.guild.id, thread.id);
		if (!eventThread) return;

		const member = await thread.guild.members.fetch(user.id);

		const [_, roleAddError] = await tryCatch(member.roles.add(eventThread.roleId, `Assigned event role for reacting to thread ${thread.id}`));

		if (roleAddError) {
			console.error(`Failed to assign role to member ${member.id} for reacting to thread ${thread.id}:`, roleAddError);
			thread.send("-# ❌ An error occurred while assigning " + userMention(user.id) + " the event role. Please contact an administrator. " + roleAddError);
		}
	},
});
