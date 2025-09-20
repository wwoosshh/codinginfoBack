import winston from 'winston';

const { combine, timestamp, errors, printf, colorize, json } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Custom format for file output
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true })
  ),
  defaultMeta: {
    service: 'codinginfo-backend',
    version: '1.3.2',
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      ),
    }),
  ],
});

// Add file transport for production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
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
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Database operation logger
export const dbLogger = {
  query: (operation: string, collection: string, query: any) => {
    logger.debug('Database Query', {
      operation,
      collection,
      query: JSON.stringify(query),
    });
  },

  error: (operation: string, collection: string, error: Error) => {
    logger.error('Database Error', {
      operation,
      collection,
      error: error.message,
      stack: error.stack,
    });
  },
};

// Authentication logger
export const authLogger = {
  login: (userId: string, ip: string, success: boolean) => {
    logger.info('Authentication Attempt', {
      userId,
      ip,
      success,
      action: 'login',
    });
  },

  register: (userId: string, ip: string) => {
    logger.info('User Registration', {
      userId,
      ip,
      action: 'register',
    });
  },

  logout: (userId: string, ip: string) => {
    logger.info('User Logout', {
      userId,
      ip,
      action: 'logout',
    });
  },
};

// Performance logger
export const perfLogger = {
  start: (operation: string) => {
    const start = process.hrtime.bigint();
    return {
      end: () => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        logger.info('Performance Metric', {
          operation,
          duration: `${duration.toFixed(2)}ms`,
        });
      },
    };
  },
};

export default logger;