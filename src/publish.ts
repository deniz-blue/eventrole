import { REST, SlashCommandBuilder, Routes } from "discord.js";
import { commands } from "./commands";
import "dotenv/config";

const api = new REST()
	.setToken(process.env.DISCORD_BOT_TOKEN!);

const main = async () => {
	console.log("Publishing commands:", commands.map(cmd => cmd.name));

	const data = [];

	for (const command of commands) {
		data.push(
			new SlashCommandBuilder()
				.setName(command.name)
				.setDescription(command.description["en"] ?? "")
				.toJSON()
		);
	}

	const global = process.argv.includes("global");

	await api.put(
		global ? Routes.applicationCommands(process.env.DISCORD_APP_ID!) : Routes.applicationGuildCommands(
			process.env.DISCORD_APP_ID!,
			process.env.DISCORD_GUILD_ID!
		),
		{ body: data }
	);
};

main().catch(console.error).finally(() => process.exit());
