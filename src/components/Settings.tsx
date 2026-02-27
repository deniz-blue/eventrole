import { Outlet, RouterProvider, createMemoryRouter, useLocation } from "react-router";
import { NavButton } from "./NavButton";
import { useInteraction } from "discord-jsx-renderer";
import { roleMention } from "discord.js";
import { SettingsEventChannelsChannel } from "./EditChannel";
import { SettingsEventChannels } from "./EditChannelList";
import { SettingsIndex } from "./SettingsIndex";
import type { GuildData } from "../database/store";

export const Settings = () => {
	const interaction = useInteraction();
	const guildId = interaction?.guildId;

	if (!guildId) {
		console.log("Settings component rendered outside of a guild context");
		return (
			<message ephemeral>
				<text>This command can only be used in a guild.</text>
			</message>
		);
	}

	console.log(`Rendering settings for guild ${guildId}`);

	return (
		<RouterProvider
			router={createMemoryRouter([
				{
					Component: SettingsLayout,
					children: [
						{
							index: true,
							Component: SettingsIndex,
						},
						{
							path: "eventChannels",
							Component: SettingsEventChannels,
						},
						{
							path: "eventChannels/:channelId",
							Component: SettingsEventChannelsChannel,
						},
					],
				}
			])}
		/>
	);
};

export const SettingsLayout = () => {
	const location = useLocation();

	return (
		<message ephemeral>
			<text>
				<code>{location.pathname}</code>
			</text>
			{location.pathname !== "/" && (
				<row>
					<NavButton to=".." style="secondary">Back</NavButton>
				</row>
			)}
			<Outlet />
		</message>
	);
};

export const EventChannelsList = ({ data }: { data: GuildData["eventChannels"] }) => {
	return (
		<ul>
			{Object.entries(data).map(([channelId, channelData]) => (
				<li key={channelId}>
					<mention channel={channelId} />: {(channelData.mentionRoleIds || []).map(roleId => roleMention(roleId)).join(", ") || (<i>No roles will be mentioned</i>)}
				</li>
			))}
		</ul>
	);
};
