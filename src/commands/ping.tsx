import { defineCommand } from "../core/command";
import { err } from "../core/err";
import { useGuildDataStore } from "../database/store";

export default defineCommand({
	name: "mention",
	description: {
		en: "Mention people who are subscribed to the event post",
	},
	async execute(interaction) {
		if (!interaction.guild) throw err("❌ This command can only be used in a server.");
		if (!interaction.channel?.isThread()) throw err("❌ This command can only be used in a thread.");

		if (
			!useGuildDataStore.getState().getEventChannel(interaction.guild.id, interaction.channel.parentId!)
		) throw err("❌ The parent channel of this thread is not registered as an event channel. Please register the parent channel first.");

		await interaction.deferReply();

		const firstMessage = await interaction.channel.messages.fetch(interaction.channel.id);
		const promises = firstMessage.reactions.cache
			.values()
			.map(reaction => reaction.users.fetch())
			.toArray();
		const allUsers = (await Promise.all(promises)).flatMap(users => users.map(user => `<@${user.id}>`));

		if (allUsers.length === 0) return void await interaction.editReply("-# No one is subscribed to this event post.");

		await interaction.editReply({
			content: `-# ${allUsers.join("")}`,
		});
	},
});
