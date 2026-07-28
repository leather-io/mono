import builder from 'content-security-policy-builder';
import { pox5ChainApiUrls } from '~/data/pox5-network-config';

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

// Every chain the dark-launched staking page can be pointed at
// (data/pox5-network-config.ts), so flipping the switch there needs no CSP
// edit. Gated like the page itself: never present on the production deploy.
const pox5ConnectSrc =
  import.meta.env.CLOUDFLARE_ENV !== 'production'
    ? pox5ChainApiUrls.flatMap(url => getUrlOrigin(url))
    : [];

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
      ...pox5ConnectSrc,
    ],
  },
});
