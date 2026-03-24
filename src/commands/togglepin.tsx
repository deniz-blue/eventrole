import { defineCommand } from "../core/command";
import { err } from "../core/err";
import { isAllowedToManage } from "../logic/checks";
import { ApplicationCommandType } from "discord.js";

export default defineCommand({
	name: "📌 Toggle Pin",
	type: "context",
	contextType: ApplicationCommandType.Message,
	description: {
		en: "Pin/unpin a message in an event channel",
	},
	execute: async (interaction) => {
		if (!interaction.guild) throw err("❌ This command can only be used in a server.");
		if (!isAllowedToManage(interaction)) throw err("❌ You are not allowed to use this command.");

		const isPinned = interaction.targetMessage.pinned;
		if(isPinned)
			await interaction.targetMessage.unpin();
		else
			await interaction.targetMessage.pin();

		await interaction.reply({ content: isPinned ? "✅ Message unpinned." : "✅ Message pinned.", ephemeral: true });
	},
});
