import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file'; // Для ротации логов
import expressWinston from 'express-winston';

const logDir = path.join(process.cwd(), 'logs');

// Общий формат логирования
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((
    {
      timestamp,
      level,
      message,
      meta,
    },
  ) => {
    const metaString = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaString}`;
  }),
);

// Конфигурация для транспорта
const createTransport = (
  filename: string,
  transportLevel: string = 'info',
) => new winston.transports.DailyRotateFile({
  filename: path.join(logDir, filename),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: transportLevel,
});

// Консольный транспорт для разработки
const createConsoleTransport = (
  transportLevel: string = 'debug',
) => new winston.transports.Console({
  level: transportLevel,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf((
      {
        timestamp, level, message, meta,
      },
    ) => {
      const metaString = meta && Object.keys(meta)
        .length ? ` ${JSON.stringify(meta)}` : '';
      return `${timestamp} [${level}]: ${message}${metaString}`;
    }),
  ),
});

// Общие настройки логгера
const getLoggerOptions = (logLevel: string = 'info') => ({
  format: logFormat,
  transports: [
    createTransport('combined-%DATE%.log', logLevel),
    createConsoleTransport(logLevel),
  ],
  exceptionHandlers: [
    createTransport('exceptions-%DATE%.log', 'error'),
    createConsoleTransport('error'),
  ],
  level: logLevel,
});

// Request лог
export const requestLogger = expressWinston.logger({
  ...getLoggerOptions('info'),
  transports: [
    createTransport('request-%DATE%.log', 'info'),
    createConsoleTransport('info'),
  ],
  meta: true,
  expressFormat: true,
  colorize: false,
});

// Error лог
export const errorLogger = expressWinston.errorLogger({
  ...getLoggerOptions('error'),
  transports: [
    createTransport('error-%DATE%.log', 'error'),
    createConsoleTransport('error'),
  ],
  meta: true,
});

// Общий логгер
export const logger = winston.createLogger(getLoggerOptions('debug'));
