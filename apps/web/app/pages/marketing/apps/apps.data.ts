// Content for /apps (verbatim from leather.io, including the CMS descriptions that end in a
// literal "...").

const assetBase = '/marketing/apps';

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
      'Bitcoin is the native asset of the Bitcoin network. Use Leather to manage BTC and connect to supported Bitcoin apps.',
  },
  {
    symbol: 'STX',
    name: 'Stacks',
    icon: `${assetBase}/stx.webp`,
    action: 'buy',
    description:
      'The token that powers Stacks. Use STX for transaction fees or stake with a pool for variable rewards paid in sBTC.',
  },
  {
    symbol: 'sBTC',
    icon: `${assetBase}/sbtc.webp`,
    action: 'get',
    href: 'https://sbtc.stacks.co/',
    description:
      'A token on Stacks backed 1:1 by BTC held through the sBTC protocol. Use sBTC in supported Stacks apps.',
  },
  {
    symbol: 'USDCx',
    icon: `${assetBase}/usdc.svg`,
    action: 'get',
    href: 'https://bridge.stacks.co/usdc/eth/stx',
    inlineLink: { text: 'Circle', href: 'https://www.circle.com' },
    description:
      'A stablecoin on Stacks backed by USDC held in Circle xReserve, for payments and DeFi.',
  },
];

interface StakingProvider {
  name: string;
  logo: string;
  rewardDetails: string;
}

const stackingDaoLogo = `${assetBase}/provider-stacking-dao.webp`;

export const dualStacking = {
  title: 'Staking opportunities',
  highlight: 'Variable rewards',
  description: 'Explore current STX staking and sBTC options',
  cta: 'Explore options',
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
      'Stake STX with a pool for variable sBTC rewards. Payout methods and fees depend on the provider.',
    href: '/staking',
    providers: [
      { name: 'Stacking DAO', logo: stackingDaoLogo, rewardDetails: 'sBTC' },
      {
        name: 'Fast pool',
        logo: `${assetBase}/provider-fast-pool.webp`,
        rewardDetails: 'sBTC / BTC',
      },
      {
        name: 'PlanBetter',
        logo: `${assetBase}/provider-planbetter.webp`,
        rewardDetails: 'BTC',
      },
    ],
  },
  {
    title: 'Liquid Staking',
    description:
      'Receive a token representing staked STX. Rewards, redemption terms and market liquidity depend on the protocol.',
    href: '/staking',
    providers: [{ name: 'Stacking DAO', logo: stackingDaoLogo, rewardDetails: 'stSTX' }],
  },
];

export interface Project {
  name: string;
  slug: string;
  description: string;
  logo: string;
  website: string;
}

function project(
  name: string,
  slug: string,
  logo: string,
  website: string,
  description: string
): Project {
  return { name, slug, logo: `${assetBase}/${logo}`, website, description };
}

const alex = project(
  'ALEX',
  'alex',
  'logo-alex.webp',
  'https://www.alexlab.co',
  'A DeFi platform on Stacks with token swaps and liquidity pools.'
);
const arkadiko = project(
  'Arkadiko',
  'arkadiko',
  'logo-arkadiko.svg',
  'https://www.arkadiko.finance',
  'A protocol on Stacks for vault-based borrowing and USDA minting.'
);
const bitflow = project(
  'Bitflow',
  'bitflow',
  'logo-bitflow.webp',
  'https://bitflow.finance',
  'A DEX aggregator and liquidity hub for token swaps on Stacks.'
);
const bnsOne = project(
  'BNS One',
  'bns-one',
  'logo-bns-one.webp',
  'https://bns.one',
  'A platform for registering and managing .btc names through the Bitcoin Name System on Stacks.'
);
const bnsHub = project(
  'BNSv2 Hub',
  'bns-hub',
  'logo-bns-hub.webp',
  'https://www.bnsv2.com',
  'A BNS V2 platform for managing names and namespaces on Stacks.'
);
const brotocol = project(
  'Brotocol',
  'brotocol',
  'logo-brotocol.webp',
  'https://brotocol.xyz',
  'A Bitcoin-native DeFi platform accessible via Leather-connected apps like BroBridge and BroSwap'
);
const charisma = project(
  'Charisma',
  'charisma',
  'logo-charisma.webp',
  'https://charisma.rocks',
  'A modular DeFi platform for vaults, swaps, and programmable token infrastructure on Stacks'
);
const granite = project(
  'Granite',
  'granite',
  'logo-granite.svg',
  'https://www.granite.world',
  'A lending protocol for borrowing stablecoins against sBTC collateral.'
);
const hermetica = project(
  'Hermetica',
  'hermetica',
  'logo-hermetica.svg',
  'https://hermetica.fi',
  'A synthetic dollar protocol using Bitcoin-based hedging strategies. Yield and terms vary.'
);
const lisa = project(
  'LISA',
  'lisa',
  'logo-lisa.webp',
  'https://www.lisalab.io',
  'A liquid staking protocol on Stacks. Token support, rewards and redemption terms depend on the protocol.'
);
const stackingDao = project(
  'Stacking DAO',
  'stacking-dao',
  'logo-stacking-dao.webp',
  'https://stackingdao.com',
  'A provider of pooled and liquid STX staking, with rewards and payout terms specific to each option.'
);
const bnsGateway = project(
  'STX City - BNS Gateway',
  'bns-gateway',
  'logo-bns-gateway.webp',
  'https://stx.city/bns',
  'A marketplace and registration platform for .btc names on STX.CITY.'
);
const velar = project(
  'Velar',
  'velar',
  'logo-velar.webp',
  'https://www.velar.com',
  'A DeFi suite offering trading, liquidity, and launchpad access built on Bitcoin L2s like Stacks'
);
const zest = project(
  'Zest Protocol',
  'zest',
  'logo-zest.svg',
  'https://www.zestprotocol.com',
  'A borrowing and lending protocol on Stacks.'
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
