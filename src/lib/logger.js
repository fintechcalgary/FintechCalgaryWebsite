/**
 * Centralized Error Logging Utility
 * Handles error logging for both development and production environments
 */

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.isProduction = process.env.NODE_ENV === "production";
  }

  /**
   * Log an error with context information
   * @param {Error|string} error - The error object or error message
   * @param {Object} context - Additional context information
   * @param {string} level - Log level (error, warn, info)
   */
  log(error, context = {}, level = "error") {
    const timestamp = new Date().toISOString();
    const errorInfo = this.formatError(error, context, timestamp);

    // Always log to console in development
    if (this.isDevelopment) {
      this.logToConsole(errorInfo, level);
    }

    // In production, log to external services
    if (this.isProduction) {
      this.logToExternal(errorInfo, level);
    }

    // Also log to browser console for client-side errors
    if (typeof window !== "undefined") {
      this.logToBrowserConsole(errorInfo, level);
    }
  }

  /**
   * Format error information for logging
   */
  formatError(error, context, timestamp) {
    const errorInfo = {
      timestamp,
      level: "error",
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : null,
      url: typeof window !== "undefined" ? window.location.href : "server",
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "server",
      context: {
        ...context,
        environment: process.env.NODE_ENV,
      },
    };

    // Add user information if available
    if (context.userId) {
      errorInfo.userId = context.userId;
    }
    if (context.sessionId) {
      errorInfo.sessionId = context.sessionId;
    }

    return errorInfo;
  }

  /**
   * Log to console (development)
   */
  logToConsole(errorInfo, level) {
    const logMethod =
      level === "error"
        ? console.error
        : level === "warn"
        ? console.warn
        : console.log;

    logMethod("🚨 Error Logged:", {
      message: errorInfo.message,
      stack: errorInfo.stack,
      context: errorInfo.context,
      timestamp: errorInfo.timestamp,
    });
  }

  /**
   * Log to browser console (client-side)
   */
  logToBrowserConsole(errorInfo, level) {
    const logMethod =
      level === "error"
        ? console.error
        : level === "warn"
        ? console.warn
        : console.log;

    logMethod("🚨 Client Error:", {
      message: errorInfo.message,
      url: errorInfo.url,
      context: errorInfo.context,
      timestamp: errorInfo.timestamp,
    });
  }

  /**
   * Log to external service (production)
   * This can be extended to integrate with services like Sentry, LogRocket, etc.
   */
  async logToExternal(errorInfo, level) {
    try {
      // Option 1: Send to your own logging endpoint
      if (process.env.LOGGING_ENDPOINT) {
        await this.sendToLoggingEndpoint(errorInfo);
      }

      // Option 2: Send to external service (uncomment and configure as needed)
      // await this.sendToSentry(errorInfo);
      // await this.sendToLogRocket(errorInfo);
    } catch (loggingError) {
      // Fallback: log to console if external logging fails
      console.error("Failed to log to external service:", loggingError);
      console.error("Original error:", errorInfo);
    }
  }

  /**
   * Send error to custom logging endpoint
   */
  async sendToLoggingEndpoint(errorInfo) {
    const response = await fetch("/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorInfo),
    });

    if (!response.ok) {
      throw new Error(`Logging endpoint returned ${response.status}`);
    }
  }

  /**
   * Log form submission errors
   */
  logFormError(formName, error, formData = {}) {
    this.log(error, {
      type: "form_submission_error",
      formName,
      formData: this.sanitizeFormData(formData),
    });
  }

  /**
   * Log API errors
   */
  logApiError(endpoint, error, requestData = {}) {
    this.log(error, {
      type: "api_error",
      endpoint,
      requestData: this.sanitizeFormData(requestData),
    });
  }

  /**
   * Log upload errors
   */
  logUploadError(fileName, error, fileInfo = {}) {
    this.log(error, {
      type: "upload_error",
      fileName,
      fileInfo: {
        size: fileInfo.size,
        type: fileInfo.type,
        lastModified: fileInfo.lastModified,
      },
    });
  }

  /**
   * Sanitize form data to remove sensitive information
   */
  sanitizeFormData(data) {
    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "ssn",
      "creditCard",
    ];
    const sanitized = { ...data };

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  /**
   * Log user actions for debugging
   */
  logUserAction(action, context = {}) {
    if (this.isDevelopment) {
      console.log("👤 User Action:", {
        action,
        context,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Export both the class and instance
export { Logger };
export default logger;
