import type { Snowflake } from "discord.js";

export interface Data {
	guilds: Record<string, GuildData>;
}

export interface GuildData {
	eventChannels: Record<Snowflake, EventChannelData>;
	eventThreads: Record<Snowflake, EventThreadData>;
}

export interface EventChannelData {
	mentionRoleIds: Snowflake[];
}

export interface EventThreadData {
	roleId: Snowflake;
}
