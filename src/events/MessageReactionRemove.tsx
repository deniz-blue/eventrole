import { Events, userMention } from "discord.js";
import { tryCatch } from "../util/trynull";
import { defineEvent } from "../core/event";
import { isStarterThreadMessage } from "../logic/checks";
import { useGuildDataStore } from "../database/store";

export default defineEvent({
	name: Events.MessageReactionRemove,
	handler: async (reaction, user) => {
		const thread = reaction.message.channel;

		if (!thread.isThread()) return;
		if (!isStarterThreadMessage(reaction.message)) return;

		const eventThread = useGuildDataStore.getState().getEventThread(thread.guild.id, thread.id);
		if (!eventThread) return;

		const member = await thread.guild.members.fetch(user.id);

		const [_, roleRemoveError] = await tryCatch(member.roles.remove(eventThread.roleId, `Removed event role for removing reaction from thread ${thread.id}`));

		if (roleRemoveError) {
			console.error(`Failed to remove role from member ${member.id} for removing reaction from thread ${thread.id}:`, roleRemoveError);
			// Show error message
			thread.send("-# ❌ An error occurred while removing " + userMention(user.id) + " the event role. Please contact an administrator. " + roleRemoveError);
		}
	},
});
