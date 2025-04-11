import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { reportWebVitals } from 'web-vitals';

export const initializeMonitoring = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: import.meta.env.VITE_APP_ENV
    });

    reportWebVitals(console.log);
  }
};

export const trackError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context
  });
};