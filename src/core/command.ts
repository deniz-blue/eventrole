import type { Translations } from "@evnt/schema";
import type { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
	name: string;
	description: Translations;

	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;

	modifyBuilder?: (builder: SlashCommandBuilder) => void;
};

export const defineCommand = (x: Command): Command => x;
