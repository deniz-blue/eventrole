import { roleMention, type Snowflake } from "discord.js";

export const EventThreadInfo = ({
	roleId,
}: {
	roleId: Snowflake;
}) => {
	return (
		<message>
			<container>
				<text>
					Role: {roleMention(roleId)}
					<br />
					React to emoji to get the mentionable role
				</text>
			</container>
		</message>
	);
};
