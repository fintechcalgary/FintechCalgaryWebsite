/**
 * Server-side structured logging utility
 * Uses Winston for production-grade logging
 */
import winston from "winston";

// Vercel and other serverless runtimes have a read-only filesystem (no logs/ dir).
const isServerless = Boolean(process.env.VERCEL);

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [];

if (!isServerless) {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5,
    })
  );
}

if (isServerless || process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: isServerless
        ? jsonFormat
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: jsonFormat,
  defaultMeta: { service: "fintech-insights" },
  transports,
});

export const logError = (message, error, context = {}) => {
  logger.error(message, {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
};

export const logInfo = (message, context = {}) => {
  logger.info(message, context);
};

export const logWarn = (message, context = {}) => {
  logger.warn(message, context);
};

export default logger;
