import { useInteraction } from "discord-jsx-renderer";
import { useGuildDataStore } from "../database/store";
import { EventChannelsList } from "./Settings";
import { NavButton } from "./NavButton";

export const SettingsIndex = () => {
	const interaction = useInteraction();
	const data = useGuildDataStore((state) => state.guilds[interaction!.guildId!]) ?? {
		eventChannels: {},
		eventThreads: {},
	};

	return (
		<container>
			<text>
				<h2>Settings Overview</h2>
				{/* Edit settings for this server */}
				<br />
				<b>Event Channels:</b>
				<EventChannelsList data={data.eventChannels} />
				<br />
				<b>Active Threads:</b>
				<br />
				{Object.keys(data.eventThreads).map((threadId) => (
					<mention channel={threadId} key={threadId} />
				)) || <i>None</i>}
			</text>
			<row>
				<NavButton to="eventChannels">Edit Event Channels</NavButton>
			</row>
		</container>
	);
};
