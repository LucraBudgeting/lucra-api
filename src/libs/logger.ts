import pino, { Logger, LoggerOptions } from 'pino';

const loggerOptions: LoggerOptions = {
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: true,
      ignore: 'pid,hostname',
      levelFirst: true,
      prettifier: true,
      useLevelLabels: true,
      levelKey: 'level',
    },
  },
  level: 'warn',
};

export const baseLogger = pino(loggerOptions);

const createLoggerWithOverride = (logger: Logger) => {
  return {
    warn: (message: string, obj?: any) => {
      logger.warn({ payload: obj }, message);
    },
    // Add other logging levels if needed
    info: (message: string, obj?: any) => {
      logger.info({ payload: obj }, message);
    },
    error: (message: string, obj?: any) => {
      logger.error({ payload: obj }, message);
    },
    debug: (message: string, obj?: any) => {
      logger.debug({ payload: obj }, message);
    },
  };
};

export const logger = createLoggerWithOverride(baseLogger);
