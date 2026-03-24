import { ChatInputCommandInteraction, ContextMenuCommandInteraction, GuildMember, Message, type PartialMessage } from "discord.js";

export const isStarterThreadMessage = (message: Message | PartialMessage) => {
	return message.channel.isThread() && message.id === message.channel.id;
};

export const isAllowedToManage = (ctx: GuildMember | ChatInputCommandInteraction | ContextMenuCommandInteraction) => {
	let userId = ctx instanceof GuildMember ? ctx.id : ctx.user.id;
	let app = ctx.client.application;
	if (app.owner?.id === userId) return true;
	if (app.owner && "members" in app.owner && app.owner.members.has(userId)) return true;

	if (ctx instanceof GuildMember) {
		return ctx.permissions.has("ManageGuild");
	} else {
		return ctx.memberPermissions?.has("ManageGuild");
	};
};
