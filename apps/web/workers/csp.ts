import builder from 'content-security-policy-builder';

export const csp = builder({
  directives: {
    defaultSrc: [`'self'`],
    // Ideally we remove unsafe-inline, however this too involved to add with
    // RR7 for leather web launch
    scriptSrc: [`'self'`, `'unsafe-inline'`],
    styleSrc: [`'self'`, "'unsafe-inline'"],
    objectSrc: [`'none'`],
    baseUri: [`'self'`],
    frameAncestors: [`'none'`],
    workerSrc: [`'self'`, 'blob:'],
    connectSrc: [
      `'self'`,
      '*.hiro.so',
      '*.ingest.us.sentry.io',
      '*.segment.com',
      '*.segment.io',
      '*.stacking-tracker.com',
      'api.leather.io',
      '*.api.leather.io',
    ],
  },
});
