import {
  createLogger as winstonCreateLogger,
  transports as winstonTransports,
} from "winston";
import type { Logger as WinstonLogger } from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";
import { createFormat } from "./createFormat";

const LOGGING_LEVEL = ["debug", "info", "warning", "error"] as const;
type LogLevel = typeof LOGGING_LEVEL[number];

type LoggingFunctionName<LogLevelT extends LogLevel> =
  `${Uncapitalize<LogLevelT>}`;
type LoggingFunctionT = (
  message: string,
  ...loggingArguments: unknown[]
) => void;

type LogLevelEnabledFunctionName<LogLevelT extends LogLevel> =
  `is${Capitalize<LogLevelT>}Enabled`;
type LogLevelEnabledFunctionT = () => boolean;

type LoggerT<LogLevelT extends LogLevel> = {
  [F in LoggingFunctionName<LogLevelT>]: LoggingFunctionT;
} & {
  [F in LogLevelEnabledFunctionName<LogLevelT>]: LogLevelEnabledFunctionT;
};

export type Logger = LoggerT<LogLevel>;

class LoggerProxy implements Logger {
  readonly #_logger: WinstonLogger;

  public constructor(logger: WinstonLogger) {
    this.#_logger = logger;
  }

  public debug(message: string, ...loggingArguments: unknown[]): void {
    this.#_logger.log("debug", message, ...loggingArguments);
  }

  public info(message: string, ...loggingArguments: unknown[]): void {
    this.#_logger.log("info", message, ...loggingArguments);
  }

  public warning(message: string, ...loggingArguments: unknown[]): void {
    this.#_logger.log("warning", message, ...loggingArguments);
  }

  public error(message: string, ...loggingArguments: unknown[]): void {
    this.#_logger.log("error", message, ...loggingArguments);
  }

  public isDebugEnabled(): boolean {
    return this.#_logger.isLevelEnabled("debug");
  }

  public isInfoEnabled(): boolean {
    return this.#_logger.isLevelEnabled("info");
  }

  public isWarningEnabled(): boolean {
    return this.#_logger.isLevelEnabled("warning");
  }

  public isErrorEnabled(): boolean {
    return this.#_logger.isLevelEnabled("error");
  }
}

export const createLogger = (): Logger => {
  const winstonLogLevels: { [P in LogLevel]: number } = {
    error: 0,
    warning: 1,
    info: 2,
    debug: 3,
  };

  const logger = winstonCreateLogger({
    level: "info",
    levels: winstonLogLevels,
    format: createFormat(),
    exitOnError: false,
    transports: [
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

  if (process.env.NODE_ENV !== "production") {
    logger.add(new winstonTransports.Console());
  }

  return new LoggerProxy(logger);
};
