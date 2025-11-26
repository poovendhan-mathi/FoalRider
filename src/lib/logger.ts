/**
 * Centralized Logging Utility
 *
 * Provides structured logging with environment-aware output.
 * In production, logs can be sent to external services (Sentry, LogRocket, etc.)
 */

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogOptions {
  context?: string;
  data?: unknown;
  timestamp?: boolean;
}

/**
 * Format log message with context
 */
function formatMessage(
  level: LogLevel,
  message: string,
  options?: LogOptions
): string {
  const timestamp =
    options?.timestamp !== false ? new Date().toISOString() : "";
  const context = options?.context ? `[${options.context}]` : "";
  const levelPrefix = level.toUpperCase();

  return `${timestamp} ${levelPrefix} ${context} ${message}`.trim();
}

/**
 * Send logs to external service (placeholder for production)
 */
function sendToExternalService(
  _level: LogLevel,
  _message: string,
  _data?: unknown
) {
  // TODO: Integrate with logging service
  // Examples:
  // - Sentry for error tracking
  // - LogRocket for session replay
  // - Datadog for log aggregation
  // - CloudWatch for AWS deployments

  if (process.env.SENTRY_DSN && _level === "error") {
    // Example: Sentry.captureException(_data);
  }
}

export const logger = {
  /**
   * Log informational messages (development only)
   */
  info(message: string, options?: LogOptions) {
    if (isDevelopment && !isTest) {
      console.log(`ℹ️  ${formatMessage("info", message, options)}`);
      if (options?.data) {
        console.log("   Data:", options.data);
      }
    }
  },

  /**
   * Log warnings
   */
  warn(message: string, options?: LogOptions) {
    if (!isTest) {
      console.warn(`⚠️  ${formatMessage("warn", message, options)}`);
      if (options?.data) {
        console.warn("   Data:", options.data);
      }
    }
    sendToExternalService("warn", message, options?.data);
  },

  /**
   * Log errors (always logged)
   */
  error(message: string, error?: unknown, options?: LogOptions) {
    const errorMessage = formatMessage("error", message, options);
    console.error(`❌ ${errorMessage}`);

    if (error instanceof Error) {
      console.error("   Error:", error.message);
      if (isDevelopment) {
        console.error("   Stack:", error.stack);
      }
    } else if (error) {
      console.error("   Error:", error);
    }

    if (options?.data) {
      console.error("   Data:", options.data);
    }

    // Send to external service
    sendToExternalService("error", message, error);
  },

  /**
   * Log debug messages (development only)
   */
  debug(message: string, options?: LogOptions) {
    if (isDevelopment && !isTest) {
      console.debug(`🐛 ${formatMessage("debug", message, options)}`);
      if (options?.data) {
        console.debug("   Data:", options.data);
      }
    }
  },

  /**
   * Log API requests (development only)
   */
  api(method: string, path: string, status: number, duration?: number) {
    if (isDevelopment && !isTest) {
      const durationStr = duration ? `${duration}ms` : "";
      const statusEmoji = status < 400 ? "✅" : "❌";
      console.log(
        `${statusEmoji} ${method} ${path} → ${status} ${durationStr}`
      );
    }
  },

  /**
   * Log database queries (development only)
   */
  db(query: string, duration?: number) {
    if (isDevelopment && !isTest) {
      const durationStr = duration ? `(${duration}ms)` : "";
      console.log(`🗄️  DB Query ${durationStr}:`, query.substring(0, 100));
    }
  },
};

/**
 * Performance timing utility
 */
export function createTimer() {
  const start = performance.now();

  return {
    end(): number {
      return Math.round(performance.now() - start);
    },
  };
}

/**
 * Example usage:
 *
 * import { logger, createTimer } from '@/lib/logger';
 *
 * // Info logging
 * logger.info('User logged in', { context: 'Auth', data: { userId: '123' } });
 *
 * // Error logging
 * try {
 *   // ... code
 * } catch (error) {
 *   logger.error('Failed to process payment', error, { context: 'Stripe' });
 * }
 *
 * // API logging
 * logger.api('POST', '/api/orders', 201, 150);
 *
 * // Performance timing
 * const timer = createTimer();
 * // ... expensive operation
 * logger.info(`Operation completed in ${timer.end()}ms`);
 */
