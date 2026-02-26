import { djsx } from "discord-jsx-renderer";
import { defineCommand } from "../core/command";
import { Settings } from "../components/Settings";
import { err } from "../core/err";
import { isAllowedToManage } from "../logic/checks";

export default defineCommand({
	name: "settings",
	description: {
		en: "Edit guild settings",
	},
	execute: async (interaction) => {
		if (!interaction.guild) throw err("❌ This command can only be used in a server.");
		if (!isAllowedToManage(interaction)) throw err("❌ You are not allowed to use this command.");

		djsx.createMessage(interaction, <Settings />);
	},
});
