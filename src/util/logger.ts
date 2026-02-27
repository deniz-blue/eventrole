import createPino from "pino";
import prettyPino from "pino-pretty";

export const logger = createPino(prettyPino({
	colorize: true,
}));

logger.level = "trace";
logger.trace("Logger initialized");
