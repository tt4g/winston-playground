import {
  createLogger,
  config as winstonConfig,
  format as winstonFormat,
  transports as winstonTransports,
} from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";

const logger = createLogger({
  level: "info",
  levels: winstonConfig.npm.levels,
  format: winstonFormat.combine(
    winstonFormat.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winstonFormat.errors({ stack: true }),
    winstonFormat.splat(),
    winstonFormat.json()
  ),
  transports: [
    new winstonTransports.Console(),
    new DailyRotateFile({
      frequency: "daily",
      dirname: "log",
      filename: "application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxFiles: "7d",
    }),
  ],
});

logger.info("Hello, World!");
logger.info("%s, %s!", "hello", "foo");
logger.error(
  "logging with %s.",
  "Error object",
  new Error("an error occurred!")
);
logger.error(new Error("log only Error object."));
