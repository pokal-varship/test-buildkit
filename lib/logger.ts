// Logger utility for safe production logging
const isDevelopment = true;;
const isProduction = false;

interface LoggerConfig {
  enableConsoleLogs: boolean;
  enableConsoleErrors: boolean;
  enableConsoleWarns: boolean;
  enableDebugLogs: boolean;
}

const config: LoggerConfig = {
  enableConsoleLogs: isDevelopment,
  enableConsoleErrors: isDevelopment || process.env.ENABLE_ERROR_LOGS === 'true',
  enableConsoleWarns: isDevelopment,
  enableDebugLogs: isDevelopment,
};

class Logger {
  private static instance: Logger;
  private originalConsole: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
    debug: typeof console.debug;
    info: typeof console.log;
  };

  private constructor() {
    // Store original console methods
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      debug: console.debug,
      info: console.info,
    };
    
    // Override console methods
    this.overrideConsole();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private overrideConsole(): void {
    // Override console.log
    console.log = (...args: unknown[]) => {
      if (config.enableConsoleLogs) {
        this.originalConsole.log(...args);
      }
    };

    // Override console.error
    console.error = (...args: unknown[]) => {
      if (config.enableConsoleErrors) {
        this.originalConsole.error(...args);
      }
      
      // In production, send errors to external service
      if (isProduction) {
        this.sendToErrorService(args);
      }
    };

    // Override console.warn
    console.warn = (...args: unknown[]) => {
      if (config.enableConsoleWarns) {
        this.originalConsole.warn(...args);
      }
    };

    // Override console.debug
    console.debug = (...args: unknown[]) => {
      if (config.enableDebugLogs) {
        this.originalConsole.debug(...args);
      }
    };

    // Override console.info
    console.info = (...args: unknown[]) => {
      if (config.enableConsoleLogs) {
        this.originalConsole.info(...args);
      }
    };
  }

  // Method to restore original console methods (useful for testing)
  restoreConsole(): void {
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.debug = this.originalConsole.debug;
    console.info = this.originalConsole.info;
  }

  // Method to update config at runtime (useful for testing)
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    Object.assign(config, newConfig);
  }

  private sendToErrorService(args: unknown[]): void {
    // In production, you can send errors to services like Sentry, LogRocket, etc.
    // This is a placeholder for error reporting service integration
    if (typeof window !== 'undefined') {
      // Client-side error reporting
      // Example: Sentry.captureException(new Error(args.join(' ')));
      console.log('Client-side error:', args);
    } else {
      // Server-side error reporting
      // Example: serverLogger.error(args.join(' '));
      console.log('Server-side error:', args);
    }
  }

  // Direct logging methods (alternative to console)
  log(...args: unknown[]): void {
    if (config.enableConsoleLogs) {
      this.originalConsole.log(...args);
    }
  }

  error(...args: unknown[]): void {
    if (config.enableConsoleErrors) {
      this.originalConsole.error(...args);
    }
    
    if (isProduction) {
      this.sendToErrorService(args);
    }
  }

  warn(...args: unknown[]): void {
    if (config.enableConsoleWarns) {
      this.originalConsole.warn(...args);
    }
  }

  debug(...args: unknown[]): void {
    if (config.enableDebugLogs) {
      this.originalConsole.log(...args)
      this.originalConsole.debug(...args);
    }
  }

  info(...args: unknown[]): void {
    if (config.enableConsoleLogs) {
      this.originalConsole.info(...args);
    }
  }
}

// Create singleton instance and initialize console override
const logger = Logger.getInstance();

// Export the logger instance and utility functions
export default logger;

// Export utility functions for easier usage (optional)
export const log = (...args: unknown[]) => logger.log(...args);
export const error = (...args: unknown[]) => logger.error(...args);
export const warn = (...args: unknown[]) => logger.warn(...args);
export const debug = (...args: unknown[]) => logger.debug(...args);
export const info = (...args: unknown[]) => logger.info(...args);

// Export for testing purposes
export { Logger, config as loggerConfig }; 