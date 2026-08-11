import { useInteraction } from "discord-jsx-renderer";
import { channelMention, roleMention } from "discord.js";
import { useParams } from "react-router";
import { useGuildDataStore } from "../database/store";

export const SettingsEventChannelsChannel = () => {
	const guildId = useInteraction()!.guildId!;
	const params = useParams();
	const channelId = params.channelId!;

	const eventChannel = useGuildDataStore(
		(state) => state.guilds[guildId]?.eventChannels[channelId],
	);

	if (!eventChannel) return <text>404 !!</text>;

	return (
		<container>
			<text>
				<h2>Event Channel: {channelMention(channelId)}</h2>
				<b>Roles to mention on event create:</b>
				<ul>
					{eventChannel?.mentionRoleIds.map((roleId) => (
						<li key={roleId}>{roleMention(roleId)}</li>
					)) || <i>None</i>}
				</ul>
				<br />
			</text>
			<row>
				<select
					type="role"
					placeholder="Set Roles to Mention for this Channel"
					defaultValues={eventChannel?.mentionRoleIds || []}
					min={0}
					max={10}
					onSelect={async (int) => {
						const selectedRoleIds = int.values || [];
						await useGuildDataStore.setState((draft) => {
							draft.guilds[guildId]!.eventChannels[channelId]!.mentionRoleIds = selectedRoleIds;
						});
					}}
				/>
			</row>
		</container>
	);
};
