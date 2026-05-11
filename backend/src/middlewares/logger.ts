import path from "path";
import winston from "winston";
import "winston-daily-rotate-file"; // Для ротации логов
import expressWinston from "express-winston";

const logDir = path.join(process.cwd(), "logs");

// Общий формат логирования
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, meta }) => {
    const metaString =
      meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${level}]: ${message}${metaString}`;
  }),
);

// Конфигурация для транспорта
const createTransport = (filename: string, level: string = "info") =>
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, filename),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level,
  });

// Консольный транспорт для разработки
const createConsoleTransport = (level: string = "debug") =>
  new winston.transports.Console({
    level,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, meta }) => {
        const metaString =
          meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        return `${timestamp} [${level}]: ${message}${metaString}`;
      }),
    ),
  });

// Общая настройка логгера
const getLoggerOptions = (level: string = "info") => ({
  format: logFormat,
  transports: [
    createTransport("combined-%DATE%.log", level),
    createConsoleTransport(level),
  ],
  exceptionHandlers: [
    createTransport("exceptions-%DATE%.log", "error"),
    createConsoleTransport("error"),
  ],
  level,
});

// Request лог
export const requestLogger = expressWinston.logger({
  ...getLoggerOptions("info"),
  transports: [
    createTransport("request-%DATE%.log"),
    createConsoleTransport("info"),
  ],
  meta: true,
  expressFormat: true,
  colorize: false,
});

// Error лог
export const errorLogger = expressWinston.errorLogger({
  ...getLoggerOptions("error"),
  transports: [
    createTransport("error-%DATE%.log"),
    createConsoleTransport("error"),
  ],
  meta: true,
});

// Общий логгер
export const logger = winston.createLogger(getLoggerOptions("debug"));
