import { Client, Partials } from "discord.js";

export let client: Client = new Client({
	intents: ["Guilds", "GuildMessageReactions", "GuildMessages"],
	partials: [Partials.Reaction, Partials.Message, Partials.Channel, Partials.User],
});

client.login(process.env.DISCORD_BOT_TOKEN);

if (import.meta.hot) {
	import.meta.hot.accept((newModule) => {
		client = (newModule as any).client;
	});
}
