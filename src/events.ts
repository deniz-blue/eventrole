import { client } from "./client";
import type { EventModule } from "./core/event";

export let events: EventModule[] = Object.values(
	import.meta.glob("./events/**/*.*", { eager: true })
).map((loader) => (loader as any).default as EventModule);

for (const { name, handler } of events)
	client.on(name, handler);

console.log("Loaded events: ", events.map((c) => c.name).join(", "));

if (import.meta.hot) {
	import.meta.hot.accept((newModule) => {
		if (!newModule) return console.error("Failed to load new module for events");

		let newEvents = (newModule as any).events as EventModule[];

		for (const { name, handler } of events)
			client.off(name, handler);

		for (const { name, handler } of newEvents)
			client.on(name, handler);

		events = newEvents;
		console.log("Events reloaded");
	});
};
