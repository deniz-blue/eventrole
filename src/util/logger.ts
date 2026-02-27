import createPino from "pino";
import prettyPino from "pino-pretty";

export const logger = createPino(prettyPino({
	minimumLevel: "trace",
}));
