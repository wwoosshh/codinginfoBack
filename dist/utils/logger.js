"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.perfLogger = exports.authLogger = exports.dbLogger = exports.requestLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, errors, printf, colorize, json } = winston_1.default.format;
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});
const fileFormat = combine(timestamp(), errors({ stack: true }), json());
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp(), errors({ stack: true })),
    defaultMeta: {
        service: 'codinginfo-backend',
        version: '1.2.2',
    },
    transports: [
        new winston_1.default.transports.Console({
            format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat),
        }),
    ],
});
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: fileFormat,
        maxsize: 5242880,
        maxFiles: 5,
    }));
    logger.add(new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        format: fileFormat,
        maxsize: 5242880,
        maxFiles: 5,
    }));
}
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.user?.userId || 'anonymous',
        };
        if (res.statusCode >= 400) {
            logger.warn('HTTP Request', logData);
        }
        else {
            logger.info('HTTP Request', logData);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
exports.dbLogger = {
    query: (operation, collection, query) => {
        logger.debug('Database Query', {
            operation,
            collection,
            query: JSON.stringify(query),
        });
    },
    error: (operation, collection, error) => {
        logger.error('Database Error', {
            operation,
            collection,
            error: error.message,
            stack: error.stack,
        });
    },
};
exports.authLogger = {
    login: (userId, ip, success) => {
        logger.info('Authentication Attempt', {
            userId,
            ip,
            success,
            action: 'login',
        });
    },
    register: (userId, ip) => {
        logger.info('User Registration', {
            userId,
            ip,
            action: 'register',
        });
    },
    logout: (userId, ip) => {
        logger.info('User Logout', {
            userId,
            ip,
            action: 'logout',
        });
    },
};
exports.perfLogger = {
    start: (operation) => {
        const start = process.hrtime.bigint();
        return {
            end: () => {
                const end = process.hrtime.bigint();
                const duration = Number(end - start) / 1000000;
                logger.info('Performance Metric', {
                    operation,
                    duration: `${duration.toFixed(2)}ms`,
                });
            },
        };
    },
};
exports.default = logger;
//# sourceMappingURL=logger.js.map