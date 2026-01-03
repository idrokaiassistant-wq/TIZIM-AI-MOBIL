export interface ErrorContext {
  error: Error;
  timestamp: number;
  userAgent?: string;
  url?: string;
  userId?: string;
  componentStack?: string;
}

class ErrorHandler {
  private errorLog: ErrorContext[] = [];
  private maxLogSize = 50;

  /**
   * Log error with context
   */
  logError(error: Error, context?: Partial<ErrorContext>): void {
    const errorContext: ErrorContext = {
      error,
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...context,
    };

    // Add to local log
    this.errorLog.push(errorContext);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorContext);
    }

    // Send to error reporting service in production
    if (import.meta.env.PROD) {
      this.reportError(errorContext);
    }
  }

  /**
   * Report error to external service
   */
  private async reportError(context: ErrorContext): Promise<void> {
    try {
      // TODO: Integrate with error reporting service (e.g., Sentry, LogRocket)
      // For now, we'll just log it
      console.error('Error reported:', context);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: Error | unknown): string {
    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        return 'Internet aloqasi bilan muammo. Iltimos, internet aloqangizni tekshiring.';
      }

      // Timeout errors
      if (error.message.includes('timeout')) {
        return 'So\'rov vaqti tugadi. Iltimos, qayta urinib ko\'ring.';
      }

      // 404 errors
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return 'Ma\'lumot topilmadi.';
      }

      // 401/403 errors
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized')) {
        return 'Kirish huquqi yo\'q. Iltimos, qayta kiring.';
      }

      // 500 errors
      if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        return 'Server xatosi. Iltimos, keyinroq qayta urinib ko\'ring.';
      }

      // Generic error
      return error.message || 'Kutilmagan xatolik yuz berdi.';
    }

    return 'Kutilmagan xatolik yuz berdi.';
  }

  /**
   * Get error log
   */
  getErrorLog(): ErrorContext[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

export const errorHandler = new ErrorHandler();

/**
 * Global error handler for unhandled errors
 */
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorHandler.logError(
      new Error(event.message),
      {
        url: event.filename,
        componentStack: event.error?.stack,
      }
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    errorHandler.logError(error);
  });
}

