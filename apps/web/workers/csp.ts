import builder from 'content-security-policy-builder';

function getUrlOrigin(url: string | undefined): string[] {
  if (!url) return [];
  return [new URL(url).origin];
}

// Allow the custom/dev backend origin; unset in production, so a no-op there.
const backendConnectSrc = getUrlOrigin(import.meta.env.LEATHER_API_URL);
const customApiConnectSrc = [
  ...getUrlOrigin(import.meta.env.LEATHER_BITCOIN_API_URL),
  ...getUrlOrigin(import.meta.env.LEATHER_STACKS_API_URL),
];

// The pox-5 devnet API the dark-launched staking page is pinned to
// (POX5_DEVNET_API_URL in pages/bitcoin-staking/bitcoin-staking.constants.ts).
// Gated like the page itself: never present on the production deploy.
const pox5DevnetConnectSrc =
  import.meta.env.CLOUDFLARE_ENV !== 'production' ? ['http://localhost:3999'] : [];

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
      'api.bnsv2.com',
      ...backendConnectSrc,
      ...customApiConnectSrc,
      ...pox5DevnetConnectSrc,
    ],
  },
});
