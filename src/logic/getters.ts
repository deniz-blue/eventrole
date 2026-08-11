import type { ChatInputCommandInteraction } from "discord.js";
import { err } from "../core/err";
import { useGuildDataStore } from "../database/store";

export const getEventChannelOrThrow = (interaction: ChatInputCommandInteraction) => {
	if (!interaction.guild) throw err("❌ This command can only be used in a server.");
	if (!interaction.channel?.isThread())
		throw err("❌ This command must be run in an event thread.");

	const eventChannel = useGuildDataStore
		.getState()
		.getEventChannel(interaction.guild.id, interaction.channel.parentId!);

	if (!eventChannel)
		throw err(
			"❌ The parent channel of this thread is not registered as an event channel. Please register the parent channel first.",
		);

	return eventChannel;
};

export const getEventThreadOrThrow = (interaction: ChatInputCommandInteraction) => {
	getEventChannelOrThrow(interaction);

	const eventThread = useGuildDataStore
		.getState()
		.getEventThread(interaction.guild!.id, interaction.channelId);

	if (!eventThread) throw err("❌ This thread is not registered as an event thread.");

	return eventThread;
};
