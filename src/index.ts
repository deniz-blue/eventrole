import { Client, Events } from "discord.js";
import { djsx } from "discord-jsx-renderer";
import "dotenv/config";
import { getCommands } from "./commands";
import { onThreadCreate } from "./events/ThreadCreate";
import { onThreadUpdate } from "./events/ThreadUpdate";
import { onMessageReactionRemove } from "./events/MessageReactionRemove";
import { onMessageReactionAdd } from "./events/MessageReactionAdd";

const client = new Client({ intents: [
	"Guilds",
	"GuildMessageReactions",
	"GuildMessages",
] });

const commands = await getCommands();

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
    djsx.dispatchInteraction(interaction);

    if(interaction.isChatInputCommand()) {
        const command = commands.find(cmd => cmd.name === interaction.commandName);
        if(command) {
            await command.execute(interaction);
        } else {
			console.warn(`No command found for ${interaction.commandName}`);
		}
    }
});

client.on(Events.ThreadCreate, onThreadCreate);
client.on(Events.ThreadUpdate, onThreadUpdate);
client.on(Events.MessageReactionAdd, onMessageReactionAdd);
client.on(Events.MessageReactionRemove, onMessageReactionRemove);

client.login(process.env.DISCORD_BOT_TOKEN);
