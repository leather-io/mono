import { type StakingPoolSlug } from '~/data/bitcoin-staking-data';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

// Content of /explorer, the "Explore" page opened inside the Leather mobile app's in-app browser.
// Copied from the retired Framer page (leather-io/mono#2579).

const assetDir = '/marketing/explorer';

export interface ExplorerImage {
  src: string;
  alt: string;
}

export interface ExplorerPromo {
  titleLines: [string, string];
  description: string;
  ctaLabel: string;
  href: string;
  art: { creature: ExplorerImage; hourglass: ExplorerImage };
}

export interface FeaturedApp {
  name: string;
  description: string;
  href: string;
  cover: string;
  logo: string;
}

export interface ExplorerApp {
  name: string;
  href: string;
  logo: string;
}

export interface ExplorerTab {
  id: string;
  label: string;
  apps: ExplorerApp[];
}

export const explorerPromo: ExplorerPromo = {
  titleLines: ['Grow your', 'Bitcoin'],
  description: 'Up to 8% with direct wallet payouts',
  ctaLabel: 'Get sBTC',
  href: '/sbtc',
  art: {
    creature: { src: `${assetDir}/promo-creature.webp`, alt: '' },
    hourglass: { src: `${assetDir}/promo-hourglass.webp`, alt: '' },
  },
};

export const featuredApps: FeaturedApp[] = [
  {
    name: 'Hermetica',
    description:
      'A Bitcoin-backed synthetic dollar that generates up to 25% APY through delta-neutral strategies',
    href: '/posts/hermetica',
    cover: `${assetDir}/featured-hermetica.webp`,
    logo: `${assetDir}/featured-logo-hermetica.svg`,
  },
  {
    name: 'Granite',
    description:
      'Use sBTC to borrow stablecoins non-custodially, without risk of forced liquidations',
    href: '/posts/granite',
    cover: `${assetDir}/featured-granite.webp`,
    logo: `${assetDir}/featured-logo-granite.svg`,
  },
  {
    name: 'ALEX',
    description:
      'A DeFi platform on Stacks offering swaps, staking, fixed-term lending, and cross-chain liquidity with Bitcoin security',
    href: '/posts/alex',
    cover: `${assetDir}/featured-alex.webp`,
    logo: `${assetDir}/featured-logo-alex.webp`,
  },
  {
    name: 'Arkadiko',
    description:
      'A Bitcoin-secured protocol for vault-based borrowing, USDA minting, and decentralized smart contract automation.',
    href: '/posts/arkadiko',
    cover: `${assetDir}/featured-arkadiko.webp`,
    logo: `${assetDir}/featured-logo-arkadiko.svg`,
  },
  {
    name: 'Bitflow',
    description:
      'A Bitcoin-native DEX aggregator and liquidity hub that sources the best prices across Stacks-based protocols.',
    href: '/posts/bitflow',
    cover: `${assetDir}/featured-bitflow.webp`,
    logo: `${assetDir}/featured-logo-bitflow.webp`,
  },
  {
    name: 'Zest Protocol',
    description:
      'A Bitcoin-native protocol on Stacks for borrowing, lending, and yield generation through overcollateralized loans and BTC staking pools',
    href: '/posts/zest',
    cover: `${assetDir}/featured-zest.webp`,
    logo: `${assetDir}/featured-logo-zest.svg`,
  },
];

function logo(name: string) {
  return `${assetDir}/logo-${name}.webp`;
}

function poolPath(slug: StakingPoolSlug) {
  return stakingPaths.pool(slug);
}

const stackingDaoApp = 'https://app.stackingdao.com/';
const lisaApp = 'https://app.lisalab.io/';

export const explorerTabs: ExplorerTab[] = [
  {
    id: 'all-apps',
    label: 'All apps',
    apps: [
      { name: 'ALEX', href: 'https://www.alexlab.co/swap', logo: logo('alex') },
      { name: 'Arkadiko', href: 'https://app.arkadiko.finance/', logo: logo('arkadiko') },
      { name: 'Bitflow', href: 'https://app.bitflow.finance/trade', logo: logo('bitflow') },
      { name: 'Brotocol', href: 'https://brotocol.xyz/bitcoin/swap', logo: logo('brotocol') },
      { name: 'Charisma', href: 'https://swap.charisma.rocks/swap', logo: logo('charisma') },
      { name: 'Granite', href: 'https://app.granite.world/', logo: logo('granite') },
      { name: 'LISA', href: lisaApp, logo: logo('lisa') },
      { name: 'Hermetica', href: 'https://app.hermetica.fi/swap', logo: logo('hermetica') },
      { name: 'Velar', href: 'https://app.velar.com/swap', logo: logo('velar') },
      { name: 'StackingDAO', href: stackingDaoApp, logo: logo('stacking-dao') },
      { name: 'Zest', href: 'https://app.zestprotocol.com/', logo: logo('zest') },
    ],
  },
  {
    id: 'lock-in-a-pool',
    label: 'Lock in a pool',
    // Framer linked these to app.leather.io/stacking/pool/<slug>; the staking flow now lives at
    // /staking/pool/<slug>. Framer's "Fast Pool V2" row is gone: there is no such pool to stake in.
    apps: [
      // Framer showed Hermetica's logo here; this is the app's own Fast Pool icon.
      { name: 'Fast Pool', href: poolPath('fast-pool'), logo: '/icons/fastpool.svg' },
      { name: 'Plan Better', href: poolPath('planbetter'), logo: logo('planbetter') },
      { name: 'Restake', href: poolPath('restake'), logo: logo('restake') },
      { name: 'Xverse', href: poolPath('xverse-pool'), logo: logo('xverse') },
      { name: 'Stacking DAO', href: poolPath('stacking-dao'), logo: logo('stacking-dao') },
    ],
  },
  {
    id: 'stay-liquid',
    label: 'Stay liquid',
    // Framer linked to app.leather.io/stacking/liquid/<slug>, which no longer exists (404).
    // Liquid stacking happens in the protocols' own apps.
    apps: [
      { name: 'StackingDAO', href: stackingDaoApp, logo: logo('stacking-dao') },
      { name: 'LISA', href: lisaApp, logo: logo('lisa') },
    ],
  },
];

export const explorerDisclaimer =
  'Leather does not operate or manage any Stacking pools or liquid Stacking protocols. Users are responsible for evaluating the risks, terms, and smart contracts involved in any third-party options they access through Leather.';
