import { ChatInputCommandInteraction, GuildMember, Message, type PartialMessage } from "discord.js";

export const isStarterThreadMessage = (message: Message | PartialMessage) => {
	return message.channel.isThread() && message.id === message.channel.id;
};

export const isAllowedToManage = (ctx: GuildMember | ChatInputCommandInteraction) => {
	if (ctx instanceof GuildMember) {
		return ctx.permissions.has("ManageGuild") || ctx.id === ctx.client.application.owner?.id;
	} else {
		return ctx.memberPermissions?.has("ManageGuild") || ctx.user.id === ctx.client.application.owner?.id;
	};
};
