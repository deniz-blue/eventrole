import { djsx } from "discord-jsx-renderer";
import { command } from "../core/command";
import { Settings } from "../components/Settings";

export default command({
	name: "settings",
	description: {
		en: "Edit guild settings",
	},
	execute: async (interaction) => {
		// Command requires MANAGE_GUILD permission
		if (!interaction.guild || !interaction.memberPermissions?.has("ManageGuild")) {
			interaction.reply({
				content: "You need the Manage Server permission to use this command.",
				ephemeral: true,
			});
			return;
		}

		djsx.createMessage(interaction, <Settings />);
	},
});
