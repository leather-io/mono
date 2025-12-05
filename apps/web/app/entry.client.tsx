import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

import * as Sentry from '@sentry/react-router';

import { LEATHER_MOCK_MODE } from './constants/environment';

Sentry.init({
  dsn: import.meta.env.LEATHER_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 0.9,
  environment: import.meta.env.MODE,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

async function enableApiMocking() {
  if (!LEATHER_MOCK_MODE) return;

  const { worker } = await import('./mocks/api/browser');

  type BypassCheck = (url: URL) => boolean;
  const bypassChecks: BypassCheck[] = [
    url => url.host === 'localhost:5173',
    url => url.host.includes('extension://'),
  ];

  return worker.start({
    onUnhandledRequest(req, print) {
      const url = new URL(req.url);
      if (bypassChecks.some(check => check(url))) return;
      print.warning();
    },
  });
}

void enableApiMocking().then(() =>
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>
    );
  })
);
