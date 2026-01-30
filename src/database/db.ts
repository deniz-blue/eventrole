import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import type { Data, GuildData } from "./models";
import { existsSync, mkdirSync } from "node:fs";

const defaultData: Data = {
	guilds: {},
};

const defaultGuildData: GuildData = {
	eventChannels: {},
	eventThreads: {},
};

const low = new Low<Data>(new JSONFile(".data/db.json"), {
	guilds: {},
});

low.read();
if (!existsSync(".data")) mkdirSync(".data", { recursive: true });

export class db {
	static async getGuildData(guildId: string) {
		await low.read();
		return low.data!.guilds[guildId] || defaultGuildData;
	}

	static async setGuildData(guildId: string, guildData: Data["guilds"][string]) {
		await low.read();
		low.data!.guilds[guildId] = guildData;
		await low.write();
	}
}
