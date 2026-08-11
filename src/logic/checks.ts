import {
	Client,
	GuildMember,
	Message,
	PermissionsBitField,
	type AnyThreadChannel,
	type APIInteractionGuildMember,
	type Channel,
	type PartialMessage,
	type Snowflake,
} from "discord.js";

export const isStarterThreadMessage = (message: Message | PartialMessage) => {
	return message.channel.isThread() && message.id === message.channel.id;
};

export const isOwner = (ctx: { client: Client<true>; user: { id: Snowflake } }) => {
	const app = ctx.client.application;
	if (app.owner?.id === ctx.user.id) return true;
	if (app.owner && "members" in app.owner && app.owner.members.has(ctx.user.id)) return true;
	return false;
};

export const isAdmin = (ctx: GuildMember | APIInteractionGuildMember | null) => {
	if (!ctx) return false;
	if (!(ctx.permissions instanceof PermissionsBitField)) return false;
	return ctx.permissions.has("ManageGuild");
};

export const isThreadOwner = (ctx: { user: { id: Snowflake }; channel: Channel }) => {
	if (!ctx.channel || !ctx.channel.isThread()) return false;
	return ctx.channel.ownerId === ctx.user.id;
};

export const canManagePins = (ctx: {
	user: { id: Snowflake };
	channel: Channel;
	member: GuildMember | APIInteractionGuildMember | null;
	client: Client<true>;
}) => {
	if (!ctx.channel || !ctx.channel.isThread()) return false;
	const managePins = ctx.channel.permissionsFor(ctx.user.id)?.has("PinMessages");
	const threadOwner = ctx.channel.ownerId === ctx.user.id;
	const owner = isOwner(ctx);
	const admin = isAdmin(ctx.member);
	return managePins || threadOwner || owner || admin;
};

export const canManageGuild = (ctx: {
	client: Client<true>;
	member: GuildMember | APIInteractionGuildMember | null;
	user: { id: Snowflake };
}) => {
	if (!ctx.member) return false;
	const admin = isAdmin(ctx.member);
	const owner = isOwner(ctx);
	return admin || owner;
};

export const canManageThread = (ctx: {
	user: { id: Snowflake };
	channel: Channel | null;
	member: GuildMember | APIInteractionGuildMember | null;
	client: Client<true>;
}): ctx is {
	user: { id: Snowflake };
	channel: AnyThreadChannel;
	member: GuildMember;
	client: Client<true>;
} => {
	if (!ctx.channel || !ctx.channel.isThread()) return false;
	const threadOwner = ctx.channel.ownerId === ctx.user.id;
	const owner = isOwner(ctx);
	const admin = isAdmin(ctx.member);
	return threadOwner || owner || admin;
};
