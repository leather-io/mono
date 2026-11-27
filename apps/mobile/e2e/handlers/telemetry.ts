import { HttpResponse, http } from 'msw';

const telemetryUrls = [
  /^https:\/\/([a-z0-9-]+\.)*mixpanel\.com\//,
  /^https:\/\/([a-z0-9-]+\.)*sentry\.io\//,
];

export const telemetryHandlers = telemetryUrls.map(url =>
  http.all(url, () => HttpResponse.json({ status: 1 }))
);
