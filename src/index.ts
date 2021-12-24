import { createLogger } from "./createLogger";

const logger = createLogger();

logger.info("Hello, World!");
logger.info("%s, %s!", "Hello", "foo");
logger.error("logging with Error object.", new Error("Failure!"));
logger.error("An error occurred!", new Error("This error will be printed."));
