import { Outlet, RouterProvider, createMemoryRouter, useLoaderData, useLocation, useNavigate, useParams } from "react-router";
import { NavButton } from "./NavButton";
import { useInteraction, useModal } from "discord-jsx-renderer";
import { db } from "../database/db";
import type { GuildData } from "../database/models";
import { channelMention, ChannelType, roleMention } from "discord.js";
import { useCallback, useState } from "react";

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

	const loader = useCallback(() => db.getGuildData(guildId), [guildId]);

	console.log(`Rendering settings for guild ${guildId}`);

	return (
		<RouterProvider
			router={createMemoryRouter([
				{
					Component: SettingsLayout,
					children: [
						{
							index: true,
							loader,
							Component: SettingsIndex,
						},
						{
							path: "eventChannels",
							loader,
							Component: SettingsEventChannels,
						},
						{
							path: "eventChannels/:channelId",
							loader,
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
					<mention channel={channelId} />: {(channelData.mentionRoleIds || []).map(roleId => roleMention(roleId)).join(", ") || (<i>None</i>)}
				</li>
			))}
		</ul>
	);
};

export const SettingsIndex = () => {
	const data = useLoaderData<GuildData>();

	if (!data) {
		return <text>Loading...</text>;
	}

	return (
		<container>
			<text>
				<h2>Guild Settings</h2>
				<br />
				<b>Event Channels:</b>
				<EventChannelsList data={data.eventChannels} />
				<br />
				<b>Active Threads:</b>
				<br />
				{Object.keys(data.eventThreads).map(threadId => (
					<mention channel={threadId} key={threadId} />
				)) || (<i>None</i>)}
			</text>
			<row>
				<NavButton to="eventChannels">Edit Event Channels</NavButton>
			</row>
		</container>
	);
};

export const SettingsEventChannels = () => {
	const data = useLoaderData<GuildData>();
	const openModal = useModal();
	const [message, setMessage] = useState<string | null>(null);
	const interaction = useInteraction();
	const navigate = useNavigate();

	if (!data) {
		return <text>Loading...</text>;
	}

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
						placeholder="Edit Channel"
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
									const guildData = await db.getGuildData(interaction.guildId!);
									guildData.eventChannels[channel.id] = { mentionRoleIds: [] };
									await db.setGuildData(interaction.guildId!, guildData);
									setMessage(`Added event channel ${channelMention(channel.id)}!`);
								}}
							>
								<label label="Channel" description="Which forum channel to use for events?">
									<select type="channel" customId="channel" channelTypes={[ChannelType.GuildForum]} min={1} max={1} />
								</label>
							</modal>
						));
					}}
				>
					Add
				</button>
			</row>
		</container>
	);
};

export const SettingsEventChannelsChannel = () => {
	const guildId = useInteraction()!.guildId!;
	const data = useLoaderData<GuildData>();
	const params = useParams();

	if (!data) {
		return <text>Loading...</text>;
	}

	const channelId = params.channelId!;

	return (
		<container>
			<text>
				<h2>Event Channel: {channelMention(channelId)}</h2>
				<b>Current Mention Roles:</b>
				<ul>
					{data.eventChannels[channelId]?.mentionRoleIds.map(roleId => (
						<li key={roleId}>{roleMention(roleId)}</li>
					)) || (<i>None</i>)}
				</ul>
			</text>
			<row>
				<select
					type="role"
					placeholder="Set Mention Roles"
					defaultValues={data.eventChannels[channelId]?.mentionRoleIds || []}
					min={0}
					max={10}
					onSelect={async (int) => {
						const guildData = await db.getGuildData(guildId);
						if (!guildData.eventChannels[channelId]) {
							guildData.eventChannels[channelId] = { mentionRoleIds: [] };
						}
						guildData.eventChannels[channelId].mentionRoleIds = int.values;
						await db.setGuildData(guildId, guildData);
					}}
				/>
			</row>
		</container>
	);
};
