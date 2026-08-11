import {
	Client,
	GuildMember,
	Message,
	User,
	type Channel,
	type PartialMessage,
	type PartialUser,
} from "discord.js";

export const isStarterThreadMessage = (message: Message | PartialMessage) => {
	return message.channel.isThread() && message.id === message.channel.id;
};

export const isAllowedToManage = (
	ctx: GuildMember | { user: User | PartialUser; channel: Channel; client: Client<true> },
) => {
	let userId = ctx instanceof GuildMember ? ctx.id : ctx.user.id;
	let app = ctx.client.application;
	if (app.owner?.id === userId) return true;
	if (app.owner && "members" in app.owner && app.owner.members.has(userId)) return true;

	if (ctx instanceof GuildMember) {
		return ctx.permissions.has("ManageGuild");
	} else {
		if (ctx.channel.isDMBased()) return false;
		return ctx.channel.permissionsFor(ctx.user.id)?.has("ManageGuild") ?? false;
	}
};

export const isThreadOwner = (ctx: { user: User | PartialUser; channel: Channel }) => {
	if (!ctx.channel || !ctx.channel.isThread()) return false;
	return ctx.channel.ownerId === ctx.user.id;
};

export const canManagePins = (ctx: {
	user: User | PartialUser;
	channel: Channel;
	client: Client<true>;
}) => {
	if (!ctx.channel || !ctx.channel.isThread()) return false;
	const managePins = ctx.channel.permissionsFor(ctx.user.id)?.has("ManageMessages");
	const threadOwner = ctx.channel.ownerId === ctx.user.id;
	const canManage = isAllowedToManage(ctx);
	return managePins || threadOwner || canManage;
};
