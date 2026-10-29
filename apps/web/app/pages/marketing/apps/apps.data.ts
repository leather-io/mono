// Content for /apps (verbatim from leather.io, including the CMS descriptions that end in a
// literal "..."). Projects and featured apps link to their CMS post at /posts/<slug>.

const assetBase = '/marketing/apps';

// ---------------------------------------------------------------------------------------------
// Core tokens
// ---------------------------------------------------------------------------------------------

interface CoreTokenBase {
  symbol: string;
  name?: string;
  icon: string;
  description: string;
}

/** "Buy" opens the install modal; "Get" makes the whole card an external link. */
export type CoreToken =
  | (CoreTokenBase & { action: 'buy' })
  | (CoreTokenBase & {
      action: 'get';
      href: string;
      /** A word in the description rendered as its own link (e.g. "Circle"). */
      inlineLink?: { text: string; href: string };
    });

export const coreTokens: CoreToken[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: `${assetBase}/btc.svg`,
    action: 'buy',
    description:
      'The most secure and decentralized asset. BTC can be safely stored in Leather and used across Bitcoin and Stacks apps.',
  },
  {
    symbol: 'STX',
    name: 'Stacks',
    icon: `${assetBase}/stx.webp`,
    action: 'buy',
    description:
      'The token that powers Stacks. STX is used to pay for transactions and can be staked to earn Bitcoin rewards on the network.',
  },
  {
    symbol: 'sBTC',
    icon: `${assetBase}/sbtc.webp`,
    action: 'get',
    href: 'https://sbtc.stacks.co/',
    description:
      'A 1:1 BTC backed that does not rely on a centralized custodian. Lets you use Bitcoin in Stacks apps.',
  },
  {
    symbol: 'USDCx',
    icon: `${assetBase}/usdc.svg`,
    action: 'get',
    href: 'https://bridge.stacks.co/usdc/eth/stx?recipient=SP1ZS9BX25WFYGHKHGY399057HT4MBH6TQMS8ZKTE',
    inlineLink: { text: 'Circle', href: 'https://www.circle.com' },
    description:
      'A 1:1 USD-backed stablecoin issued by Circle via xReserve and native to Stacks for payments and on-chain stability.',
  },
];

// ---------------------------------------------------------------------------------------------
// Earning on Stacks
// ---------------------------------------------------------------------------------------------

export interface StakingProvider {
  name: string;
  logo: string;
  historicalYield: string;
}

const stackingDaoLogo = `${assetBase}/provider-stacking-dao.webp`;

export const dualStacking = {
  title: 'Dual stacking',
  highlight: 'Up to 5% APY in sBTC',
  description: 'Hold sBTC & boost with STX Stacking or DeFi',
  cta: 'Start earning',
  href: 'https://app.stacks.co/',
  image: { src: `${assetBase}/dual-stacking-coins.webp`, width: 828, height: 434 },
};

interface StakingOption {
  title: string;
  description: string;
  href: string;
  providers: StakingProvider[];
}

export const stakingOptions: StakingOption[] = [
  {
    title: 'Pooled staking',
    description:
      'Stake with others to earn BTC. Your STX stay locked for each cycle, and you earn steady rewards.',
    href: '/staking',
    providers: [
      { name: 'Stacking DAO', logo: stackingDaoLogo, historicalYield: '9.27%' },
      { name: 'Fast pool', logo: `${assetBase}/provider-fast-pool.webp`, historicalYield: '8.59%' },
      {
        name: 'PlanBetter',
        logo: `${assetBase}/provider-planbetter.webp`,
        historicalYield: '8.57%',
      },
    ],
  },
  {
    title: 'Liquid Staking',
    description:
      'Keep your STX flexible and still earn BTC. Get a liquid token that lets you trade or use your staked STX anytime.',
    href: '/staking',
    providers: [{ name: 'Stacking DAO', logo: stackingDaoLogo, historicalYield: '8.72%' }],
  },
];

// ---------------------------------------------------------------------------------------------
// Projects (and the featured subset shown in the carousel)
// ---------------------------------------------------------------------------------------------

export interface Project {
  name: string;
  slug: string;
  /** Sanity post the card links to (`/posts/:postSlug`); usually the same as `slug`. */
  postSlug: string;
  description: string;
  logo: string;
}

function project(
  name: string,
  slug: string,
  logo: string,
  description: string,
  postSlug = slug
): Project {
  return { name, slug, postSlug, logo: `${assetBase}/${logo}`, description };
}

const alex = project(
  'ALEX',
  'alex',
  'logo-alex.webp',
  'A DeFi platform on Stacks offering swaps, staking, fixed-term lending, and cross-chain liquidity with Bitcoin...'
);
const arkadiko = project(
  'Arkadiko',
  'arkadiko',
  'logo-arkadiko.svg',
  'A Bitcoin-secured protocol for vault-based borrowing, USDA minting, and decentralized smart contract automatio...'
);
const bitflow = project(
  'Bitflow',
  'bitflow',
  'logo-bitflow.webp',
  'A Bitcoin-native DEX aggregator and liquidity hub that sources the best prices across Stacks-based protocols.'
);
const bnsOne = project(
  'BNS One',
  'bns-one',
  'logo-bns-one.webp',
  'BNS One is a Bitcoin Name System platform for registering and managing .btc domain names on Bitcoin via the St...',
  // The per-app BNS posts redirect to the BNS explainer; link there directly
  'bns'
);
const bnsHub = project(
  'BNSv2 Hub',
  'bns-hub',
  'logo-bns-hub.webp',
  'BNS Hub is the BNS V2 management platform for registering names, creating namespaces, and building with the BN...',
  // The per-app BNS posts redirect to the BNS explainer; link there directly
  'bns'
);
const brotocol = project(
  'Brotocol',
  'brotocol',
  'logo-brotocol.webp',
  'A Bitcoin-native DeFi platform accessible via Leather-connected apps like BroBridge and BroSwap'
);
const charisma = project(
  'Charisma',
  'charisma',
  'logo-charisma.webp',
  'A modular DeFi platform for vaults, swaps, and programmable token infrastructure on Stacks'
);
const granite = project(
  'Granite',
  'granite',
  'logo-granite.svg',
  'Use sBTC to borrow stablecoins non-custodially, without risk of forced liquidations'
);
const hermetica = project(
  'Hermetica',
  'hermetica',
  'logo-hermetica.svg',
  'A Bitcoin-backed synthetic dollar that generates up to 25% APY through delta-neutral strategies'
);
const lisa = project(
  'LISA',
  'lisa',
  'logo-lisa.webp',
  'A liquid staking protocol built on Stacks that lets you earn yield on assets like STX and ALEX—without locking...'
);
const stackingDao = project(
  'Stacking DAO',
  'stacking-dao',
  'logo-stacking-dao.webp',
  'Stacking infrastructure offering native and liquid options with BTC and STX-based yield'
);
const bnsGateway = project(
  'STX City - BNS Gateway',
  'bns-gateway',
  'logo-bns-gateway.webp',
  'BNS Gateway on STX.CITY is a marketplace and registration platform for .btc domains, with analytics, social fe...',
  // The per-app BNS posts redirect to the BNS explainer; link there directly
  'bns'
);
const velar = project(
  'Velar',
  'velar',
  'logo-velar.webp',
  'A DeFi suite offering trading, liquidity, and launchpad access built on Bitcoin L2s like Stacks'
);
const zest = project(
  'Zest Protocol',
  'zest',
  'logo-zest.svg',
  'A Bitcoin-native protocol on Stacks for borrowing, lending, and yield generation through overcollateralized lo...'
);

/** Alphabetical, as on leather.io. */
export const projects: Project[] = [
  alex,
  arkadiko,
  bitflow,
  bnsOne,
  bnsHub,
  brotocol,
  charisma,
  granite,
  hermetica,
  lisa,
  stackingDao,
  bnsGateway,
  velar,
  zest,
];

export interface FeaturedApp extends Project {
  cover: { src: string; width: number; height: number };
}

function cover(name: string, height = 450) {
  return { src: `${assetBase}/featured-${name}.webp`, width: 900, height };
}

export const featuredApps: FeaturedApp[] = [
  { ...bitflow, cover: cover('bitflow') },
  { ...zest, cover: cover('zest') },
  { ...hermetica, cover: cover('hermetica') },
  { ...granite, cover: cover('granite', 624) },
  { ...arkadiko, cover: cover('arkadiko') },
];
