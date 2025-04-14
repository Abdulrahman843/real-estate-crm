import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { reportWebVitals } from 'web-vitals';

const isProd = import.meta.env.PROD;

export const initializeMonitoring = () => {
  if (isProd && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: import.meta.env.VITE_APP_ENV || 'production',
    });

    // Report Web Vitals to Sentry or log them
    reportWebVitals((metric) => {
      console.log('[Web Vitals]', metric);
      Sentry.captureMessage(`Web Vitals - ${metric.name}`, {
        level: 'info',
        extra: metric
      });
    });
  } else {
    console.warn('⚠️ Monitoring is not initialized (non-production or missing DSN)');
  }
};

/**
 * Capture app-level errors with additional context.
 * @param {Error} error - The error to report.
 * @param {Object} context - Additional context metadata.
 */
export const trackError = (error, context = {}) => {
  if (isProd) {
    Sentry.captureException(error, {
      extra: context
    });
  } else {
    console.error('[Tracked Error]', error, context);
  }
};
