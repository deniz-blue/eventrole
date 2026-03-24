import { defineCommand } from "../core/command";
import { err } from "../core/err";
import { useGuildDataStore } from "../database/store";
import { isAllowedToManage } from "../logic/checks";

export default defineCommand({
	type: "slash",
	name: "mention",
	description: {
		en: "Mention the event role",
	},
	async execute(interaction) {
		if (!interaction.guild) throw err("❌ This command can only be used in a server.");
		if (!interaction.channel?.isThread()) throw err("❌ This command can only be used in a thread.");
		if (!isAllowedToManage(interaction)) throw err("❌ You are not allowed to use this command.");

		if (
			!useGuildDataStore.getState().getEventChannel(interaction.guild.id, interaction.channel.parentId!)
		) throw err("❌ The parent channel of this thread is not registered as an event channel. Please register the parent channel first.");

		const roleId = useGuildDataStore.getState().getEventThread(interaction.guild.id, interaction.channel.id)?.roleId;
		if (!roleId) throw err("❌ This thread is not registered as an event thread. Please register this thread first.");

		await interaction.reply({
			content: `-# <@&${roleId}>`,
		});

		// await interaction.deferReply({
		// 	flags: [MessageFlags.Ephemeral],
		// });

		// const firstMessage = await interaction.channel.messages.fetch(interaction.channel.id);
		// const promises = firstMessage.reactions.cache
		// 	.values()
		// 	.map(reaction => reaction.users.fetch())
		// 	.toArray();
		// const allUsers = (await Promise.all(promises)).flatMap(users => users.map(user => `<@${user.id}>`));

		// if (allUsers.length === 0) return void await interaction.editReply("-# No one is subscribed to this event post.");

		// await interaction.channel.send({
		// 	content: `-# ${allUsers.join("")}`,
		// });

		// await interaction.editReply("-# Mentioned all subscribers!");
	},
});
