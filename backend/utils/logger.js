/**
 * Structured logging utility for consistent, robust logging across the backend
 * Logs request context, processing steps, errors, and performance metrics
 */

const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

const getCurrentTimestamp = () => new Date().toISOString();

const formatLog = (level, context, message, data = null) => {
  const logEntry = {
    timestamp: getCurrentTimestamp(),
    level,
    context,
    message,
  };

  if (data) {
    logEntry.data = data;
  }

  return JSON.stringify(logEntry);
};

const logger = {
  error: (context, message, data = null) => {
    console.error(formatLog(LOG_LEVELS.ERROR, context, message, data));
  },

  warn: (context, message, data = null) => {
    console.warn(formatLog(LOG_LEVELS.WARN, context, message, data));
  },

  info: (context, message, data = null) => {
    console.log(formatLog(LOG_LEVELS.INFO, context, message, data));
  },

  debug: (context, message, data = null) => {
    if (
      process.env.DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    ) {
      console.log(formatLog(LOG_LEVELS.DEBUG, context, message, data));
    }
  },

  /**
   * Log API endpoint access with request details
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {object} req - Express request object (for IP and user info)
   * @param {object} query - Query parameters
   */
  logRequest: (method, endpoint, req, query = {}) => {
    const ip = req?.ip || req?.connection?.remoteAddress || "unknown";
    const username = req?.user?.name || "anonymous";
    const data = {
      method,
      endpoint,
      ip,
      username,
      query: Object.keys(query).length > 0 ? query : undefined,
    };
    logger.debug("API_REQUEST", `${method} ${endpoint}`, data);
  },

  /**
   * Log successful response with performance data
   * @param {string} endpoint - API endpoint
   * @param {number} statusCode - HTTP status code
   * @param {number} durationMs - Request duration in milliseconds
   * @param {object} responseData - Response metadata (not full response body)
   */
  logSuccess: (endpoint, statusCode, durationMs, responseData = {}) => {
    const data = {
      endpoint,
      statusCode,
      durationMs,
      ...responseData,
    };
    logger.info(
      "API_RESPONSE",
      `${endpoint} completed in ${durationMs}ms`,
      data,
    );
  },

  /**
   * Log database operations
   * @param {string} operation - Operation type (e.g., 'find', 'save', 'update')
   * @param {string} collection - Collection name
   * @param {object} details - Operation details
   */
  logDb: (operation, collection, details = {}) => {
    const data = {
      operation,
      collection,
      ...details,
    };
    logger.debug("DATABASE", `${operation} on ${collection}`, data);
  },

  /**
   * Log error with full context
   * @param {string} context - Error context
   * @param {Error} error - Error object
   * @param {object} additionalData - Additional context data
   */
  logError: (context, error, additionalData = {}) => {
    const data = {
      message: error?.message,
      code: error?.code,
      statusCode: error?.statusCode,
      ...additionalData,
    };
    logger.error(context, `${context}: ${error?.message}`, data);
  },

  /**
   * Log validation errors
   * @param {string} context - Validation context
   * @param {array|string} errors - Validation errors
   */
  logValidation: (context, errors) => {
    logger.warn("VALIDATION", context, { errors });
  },
};

export default logger;
