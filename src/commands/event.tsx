import { MessageFlags, messageLink } from "discord.js";
import { defineCommand } from "../core/command";
import { err } from "../core/err";
import { canManageThread } from "../logic/checks";
import { getEventThreadOrThrow } from "../logic/getters";
import type {
	LinkComponent,
	MediaSource,
	OpenEvnt,
	RichTextMarkdownComponent,
	SourceComponent,
	SplashMediaComponent,
} from "@evnt/types";
import { useGuildDataStore } from "../database/store";
import { djsx } from "discord-jsx-renderer";
import { DiscordFormatter } from "@evnt/pretty";

export default defineCommand({
	name: "event",
	type: "slash",
	description: {
		en: "Rich Event details",
	},
	execute: async (interaction) => {
		if (!interaction.guild) throw err("❌ This command can only be used in a server.");
		if (!interaction.channel?.isThread()) throw err("❌ You are not allowed to use this command.");

		if (!getEventThreadOrThrow(interaction).openevnt) {
			await interaction.deferReply({
				flags: [MessageFlags.Ephemeral],
			});

			const firstMessage = await interaction.channel.messages.fetch(interaction.channelId);
			if (!firstMessage) throw err("❌ Failed to fetch the first message of this thread.");

			const splash = firstMessage.attachments.first();

			const draft: OpenEvnt = {
				v: "0.1",
				$type: "directory.evnt.event",
				name: {
					en: interaction.channel.name,
				},
				components: [
					{
						$type: "directory.evnt.component.link",
						url: messageLink(interaction.channelId, interaction.channelId, interaction.guild.id),
						name: { en: "Event Post on Discord" },
					} as LinkComponent,
					{
						$type: "directory.evnt.richtext.markdown",
						content: firstMessage.content,
						flavor: "discord",
					} as RichTextMarkdownComponent,
					{
						$type: "directory.evnt.component.source",
						url: messageLink(interaction.channelId, interaction.channelId, interaction.guild.id),
					} as SourceComponent,
					...(splash
						? [
								{
									$type: "directory.evnt.component.splashMedia",
									roles: ["background", "banner", "poster"],
									media: {
										sources: [
											{
												url: splash.url,
												mimeType: splash.contentType ?? undefined,
												dimensions:
													splash.width && splash.height
														? { width: splash.width, height: splash.height }
														: undefined,
											} as MediaSource,
										],
										alt: { en: splash.description },
									},
								} as SplashMediaComponent,
							]
						: []),
				],
			};

			const res = await fetch(`https://folio.denizblue.workers.dev/events`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(draft),
			});

			if (!res.ok) throw err(`❌ Failed to create event on Folio: ${res.status} ${res.statusText}`);

			const { id, edit_token } = (await res.json()) as { id: string; edit_token: string };

			useGuildDataStore.setState((state) => {
				state.guilds[interaction.guild!.id]!.eventThreads[interaction.channelId]!.openevnt = {
					type: "folio",
					id,
					token: edit_token,
				};
			});
		}

		const eventThread = getEventThreadOrThrow(interaction);

		if (eventThread.openevnt?.type !== "folio") throw err("❌ Invariant!");

		const res = await fetch(
			`https://folio.denizblue.workers.dev/events/${eventThread.openevnt.id}`,
		);

		const data = (await res.json()) as OpenEvnt;

		const canEdit = canManageThread(interaction);

		const shareLink = `https://eventsl.ink/e?${new URLSearchParams({
			url: `https://folio.denizblue.workers.dev/events/${eventThread.openevnt.id}?${canEdit ? new URLSearchParams({ token: eventThread.openevnt.token }) : ""}`,
		})}`;

		djsx.createMessage(
			interaction,
			<EventDisplay data={data} canEdit={canEdit} shareLink={shareLink} />,
		);
	},
});

export const EventDisplay = ({
	data,
	canEdit,
	shareLink,
}: {
	data: OpenEvnt;
	canEdit: boolean;
	shareLink: string;
}) => {
	const summary = new DiscordFormatter(DiscordFormatter.discordDefaults).formatEvent(data);

	return (
		<message ephemeral>
			<container>
				<text>{summary}</text>
			</container>
			<container>
				<section>
					<accessory>
						<button url={shareLink}>View{canEdit && " & Edit"} Event</button>
					</accessory>
					<text>
						To view{canEdit && " (and edit!!)"} the event, you should install the Vantage app.
						<br /> <a href="https://groups.google.com/g/tsxlt">Join the Google Group</a> to be able
						to{" "}
						<a href="https://play.google.com/store/apps/details?id=lt.tsx.vantage">
							install the app on Google Play
						</a>
						.
					</text>
				</section>
				<text>
					<subtext>
						Or you can also use the web version. You do you. Report issues to @deniz.blue!
						{canEdit && (
							<>
								<br />
								⚠️ The link above grants <b>edit access</b> - do not share it with anyone you don't
								trust!
							</>
						)}
					</subtext>
				</text>
			</container>
		</message>
	);
};
