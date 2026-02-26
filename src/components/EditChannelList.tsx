import { useInteraction, useModal } from "discord-jsx-renderer";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useGuildDataStore } from "../database/store";
import { EventChannelsList } from "./Settings";
import { channelMention, ChannelType } from "discord.js";

export const SettingsEventChannels = () => {
	const openModal = useModal();
	const [message, setMessage] = useState<string | null>(null);
	const interaction = useInteraction();
	const navigate = useNavigate();

	const data = useGuildDataStore(state => state.guilds[interaction!.guildId!]) ?? { eventChannels: {}, eventThreads: {} };

	return (
		<container>
			<text>
				<h2>Event Channels</h2>
				<EventChannelsList data={data.eventChannels} />
				{message && (<>
					<br />
					<b>{message}</b>
				</>)}
			</text>
			{Object.keys(data.eventChannels).length > 0 && (
				<row>
					<select
						type="string"
						placeholder="Edit Channel from List"
						onSelect={(int) => navigate(`/eventChannels/${int.values[0]}`)}
					>
						{Object.entries(data.eventChannels).map(([channelId, channelData]) => (
							<option
								label={interaction?.guild?.channels.cache.get(channelId)?.name || channelId}
								key={channelId}
								value={channelId}
							/>
						))}
					</select>
				</row>
			)}
			<row>
				<button
					style="success"
					onClick={() => {
						openModal((
							<modal
								title="Add Event Channel"
								onSubmit={async (interaction) => {
									const channel = interaction.fields.getSelectedChannels("channel")!.at(0)!;

									await useGuildDataStore.setState(draft => {
										draft.guilds[interaction.guildId!] ??= { eventChannels: {}, eventThreads: {} };
										draft.guilds[interaction.guildId!]!.eventChannels[channel.id] = { mentionRoleIds: [] };
									});

									setMessage(`Added event channel ${channelMention(channel.id)}!`);
									await interaction.deferUpdate();
								}}
							>
								<label label="Channel" description="Which forum channel to use for events?">
									<select type="channel" customId="channel" channelTypes={[ChannelType.GuildForum]} min={1} max={1} />
								</label>
							</modal>
						));
					}}
				>
					Add New Event Channel
				</button>
			</row>
		</container>
	);
};
