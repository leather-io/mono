import builder from 'content-security-policy-builder';

// The backend origin is api.leather.io in production (already allowed below), but a
// custom/dev build points LEATHER_API_URL at a local or private gateway that must be
// allowed to connect. Unset in production, so this is a no-op there.
const backendConnectSrc = import.meta.env.LEATHER_API_URL ? [import.meta.env.LEATHER_API_URL] : [];

export const csp = builder({
  directives: {
    defaultSrc: [`'self'`],
    // Ideally we remove unsafe-inline, however this too involved to add with
    // RR7 for leather web launch
    scriptSrc: [`'self'`, `'unsafe-inline'`],
    frameSrc: [`'self'`, 'https://www.youtube.com'],
    styleSrc: [`'self'`, "'unsafe-inline'"],
    objectSrc: [`'none'`],
    baseUri: [`'self'`],
    frameAncestors: [`'none'`],
    workerSrc: [`'self'`, 'blob:'],
    imgSrc: [`'self'`, 'data:', 'https://images.leather.io', 'https://cdn.sanity.io/', '*'],
    connectSrc: [
      `'self'`,
      '*.hiro.so',
      'gamma.io',
      '*.ingest.us.sentry.io',
      '*.mixpanel.com',
      '*.stacking-tracker.com',
      'api.leather.io',
      '*.api.leather.io',
      'https://sbtc-emily.com',
      'https://webhook.frontapp.com',
      'leatherapi.bestinslot.xyz',
      ...backendConnectSrc,
    ],
  },
});
