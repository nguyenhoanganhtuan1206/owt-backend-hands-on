import type { LoggerService } from '@nestjs/common';
import { ConsoleLogger } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const fileTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} [${level.toUpperCase()}]: ${message}`,
    ),
  ),
  transports: [fileTransport],
});

export class FileLogger extends ConsoleLogger implements LoggerService {
  log(message: string, context?: string) {
    super.log(message, context);
    logger.info(message, { context });
  }

  error(message: string, trace: string, context?: string) {
    super.error(message, trace, context);
    logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
    logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
    logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context);
    logger.verbose(message, { context });
  }
}
