import type { Snowflake } from "discord.js";
import { create } from "zustand";
import { JSONFileSync } from "lowdb/node"
import { type PersistStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface GuildData {
	eventChannels: Record<Snowflake, {
		mentionRoleIds: Snowflake[];
	}>;
	eventThreads: Record<Snowflake, {
		roleId: Snowflake;
	}>;
}

export interface GuildDataState {
	guilds: Record<string, GuildData>;
}

export interface GuildDataActions {
	getEventThread(guildId: string, threadId: string): GuildData["eventThreads"][string] | null;
	getEventChannel(guildId: string, channelId: string): GuildData["eventChannels"][string] | null;
}

const version = 0;
const adapter = new JSONFileSync("./.data/db.json");
const storage: PersistStorage<any> = {
	getItem: (key) => ({
		state: adapter.read() ?? null,
		version,
	}),
	setItem: (key, { state }) => adapter.write(state),
	removeItem: (key) => { },
};

export const useGuildDataStore = create<GuildDataState & GuildDataActions>()(
	persist(
		immer((set, get) => ({
			guilds: {},

			getEventThread(guildId, threadId) {
				return get().guilds[guildId]?.eventThreads[threadId] ?? null;
			},

			getEventChannel(guildId, channelId) {
				return get().guilds[guildId]?.eventChannels[channelId] ?? null;
			},
		})),
		{
			version,
			name: "db.json",
			storage,
		},
	)
);
