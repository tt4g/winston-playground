import { EOL } from "os";
import { MESSAGE, SPLAT } from "triple-beam";
import { format as winstonFormat } from "winston";

const isUndefined = (value: unknown): value is undefined => value === void 0;

const isNull = (value: unknown): value is null => value === null;

const isNullOrUndefined = (value: unknown): value is null | undefined =>
  isNull(value) || isUndefined(value);

const isArray = Array.isArray;

const isError = (value: unknown): value is Error => value instanceof Error;

const isString = (value: unknown): value is string => {
  const type = typeof value;

  if (type === "string") {
    return true;
  }

  if (isNullOrUndefined(value)) {
    return false;
  }

  if (isArray(value)) {
    return false;
  }

  if (type !== "object") {
    return false;
  }

  return Object.prototype.toString.call(value) === "[object String]";
};

const findFirstError = (splat: unknown): Error | undefined => {
  if (!isArray(splat)) {
    return void 0;
  }

  return splat.find(isError);
};

/**
 * Select the error object to be printed in the log message.
 */
const selectErrorForPrinting = (error: Error): unknown => {
  if (isString(error.stack)) {
    return error.stack;
  } else {
    return error;
  }
};

/**
 * `winston` custom formatter.
 *
 * The `eol` option can be used to change the newline character added in the log
 * message.
 * Example: `lineFormatter({ eol: "\n" })`
 */
const lineFormatter = winstonFormat((loggingInfo, { eol = EOL }) => {
  // The formatter provided by `winston` does not allow the output of `Error`
  // and the format of log messages to be adjusted freely, so a custom formatter
  // is defined.
  // See: https://github.com/winstonjs/winston/tree/v3.3.3#creating-custom-formats
  //
  // `winston.format.json` is in JSON format, which is easy to parse, but not
  // human-readable.
  // `winston.format.simple` will make it a single-line text in a fixed format,
  // but will not look for `Error` in the logging argument and print it in the
  // log message, nor will it print the timestamp added by
  // `winston.format.timestamp`.
  // `winston.format.printf` can also process log messages, but it cannot define
  // formatter options.
  //
  // For the above reasons, own custom formatter is defined.
  //
  // TIP: The log format of `winston` is adjusted by the log object stream
  //  developed in `logform` (https://github.com/winstonjs/logform).
  //  The `logform` adds log data to the properties of the log object accessible
  //  with `Symbol`, which is maintained by `triple-beam`
  //  (https://github.com/winstonjs/triple-beam).

  const message = `${loggingInfo.timestamp} [${loggingInfo.level}] - ${loggingInfo.message}`;

  // Print the first `Error` found from the logging arguments passed to
  // `logger.log(...)` at the tail of the log message.
  //
  // The `logger.log()` in `winston` considers the first argument as the log
  // level, the second argument as the log message, and the rest of the arguments
  // are stored in the properties accessible by `SPLAT`.
  // Get `Error` from this rest of the arguments and print it to the log message.
  //
  // NOTE: A similar feature is provided by `winston.format.errors`, but If the
  //  second argument is a log message and the third and subsequent arguments are
  //  set to `Error`, `Error` is ignored.
  //  Because `winston.format.errors` gets its information from the `Error`
  //  passed as the second argument to `logger.log()`, the third and subsequent
  //  `Error` arguments are ignored.

  // NOTE: Typescript 4.5.x does not support property access with unique symbols.
  //  Ignore the error with `as unknown as string`.
  //  See: https://github.com/microsoft/TypeScript/pull/44512
  const splat = loggingInfo[SPLAT as unknown as string];
  const error = findFirstError(splat);

  // The log message to be printed from `winston` should be set in the `MESSAGE`
  // property.
  loggingInfo[MESSAGE as unknown as string] = isUndefined(error)
    ? message
    : message + eol + selectErrorForPrinting(error);

  return loggingInfo;
});

export const createFormat = () =>
  winstonFormat.combine(
    winstonFormat.timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS ZZ",
    }),
    winstonFormat.splat(),
    lineFormatter()
  );
