import * as Sentry from '@sentry/react-router';

Sentry.init({
  dsn: process.env.LEATHER_SENTRY_DSN,
});
