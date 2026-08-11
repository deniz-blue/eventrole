import type { Translations } from "@evnt/schema";
import type {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	ContextMenuCommandType,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction,
} from "discord.js";

export interface BaseCommand {
	name: string;
	description: Translations;
}

export interface SlashCommand extends BaseCommand {
	type: "slash";
	contextType?: ContextMenuCommandType;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface MessageContextMenuCommand extends BaseCommand {
	type: "context";
	contextType: ApplicationCommandType.Message;
	execute: (interaction: MessageContextMenuCommandInteraction) => Promise<void>;
}

export interface UserContextMenuCommand extends BaseCommand {
	type: "context";
	contextType: ApplicationCommandType.User;
	execute: (interaction: UserContextMenuCommandInteraction) => Promise<void>;
}

export type Command = SlashCommand | MessageContextMenuCommand | UserContextMenuCommand;

export const defineCommand = (x: Command): Command => x;
