import type { ClientEvents } from "discord.js";

export interface EventHandler<EventName extends keyof ClientEvents = keyof ClientEvents> {
	(...args: ClientEvents[EventName]): Promise<void>;
};

export interface EventModule<name extends keyof ClientEvents = keyof ClientEvents> {
	name: name;
	handler: EventHandler<name>;
};

export const defineEvent = <EventName extends keyof ClientEvents>(x: EventModule<EventName>): EventModule<EventName> => x;
