import { Client, Events } from "discord.js";
import "dotenv/config";
import { onThreadCreate } from "./events/ThreadCreate";
import { onThreadUpdate } from "./events/ThreadUpdate";
import { onMessageReactionRemove } from "./events/MessageReactionRemove";
import { onMessageReactionAdd } from "./events/MessageReactionAdd";
import { onClientReady } from "./events/ClientReady";
import { onInteractionCreate } from "./events/InteractionCreate";

const client = new Client({
	intents: [
		"Guilds",
		"GuildMessageReactions",
		"GuildMessages",
	]
});

client.on(Events.InteractionCreate, onInteractionCreate);
client.on(Events.ClientReady, onClientReady);
client.on(Events.ThreadCreate, onThreadCreate);
client.on(Events.ThreadUpdate, onThreadUpdate);
client.on(Events.MessageReactionAdd, onMessageReactionAdd);
client.on(Events.MessageReactionRemove, onMessageReactionRemove);

client.login(process.env.DISCORD_BOT_TOKEN);
