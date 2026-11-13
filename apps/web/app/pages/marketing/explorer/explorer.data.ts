import { type StakingPoolSlug } from '~/data/bitcoin-staking-data';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

// Content of /explorer, the "Explore" page opened inside the Leather mobile app's in-app browser.

const assetDir = '/marketing/explorer';

interface ExplorerImage {
  src: string;
  alt: string;
}

interface ExplorerPromo {
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

interface ExplorerTab {
  id: string;
  label: string;
  apps: ExplorerApp[];
}

export const explorerPromo: ExplorerPromo = {
  titleLines: ['Explore', 'sBTC'],
  description: 'Compare independent sBTC providers and variable rewards',
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
      'A synthetic dollar protocol using Bitcoin-based hedging strategies. Yield and terms vary.',
    href: '/posts/hermetica',
    cover: `${assetDir}/featured-hermetica.webp`,
    logo: `${assetDir}/featured-logo-hermetica.svg`,
  },
  {
    name: 'Granite',
    description: 'A lending protocol for borrowing stablecoins against sBTC collateral.',
    href: '/posts/granite',
    cover: `${assetDir}/featured-granite.webp`,
    logo: `${assetDir}/featured-logo-granite.svg`,
  },
  {
    name: 'ALEX',
    description: 'A DeFi platform on Stacks with token swaps and liquidity pools.',
    href: '/posts/alex',
    cover: `${assetDir}/featured-alex.webp`,
    logo: `${assetDir}/featured-logo-alex.webp`,
  },
  {
    name: 'Arkadiko',
    description: 'A protocol on Stacks for vault-based borrowing and USDA minting.',
    href: '/posts/arkadiko',
    cover: `${assetDir}/featured-arkadiko.webp`,
    logo: `${assetDir}/featured-logo-arkadiko.svg`,
  },
  {
    name: 'Bitflow',
    description: 'A DEX aggregator and liquidity hub for token swaps on Stacks.',
    href: '/posts/bitflow',
    cover: `${assetDir}/featured-bitflow.webp`,
    logo: `${assetDir}/featured-logo-bitflow.webp`,
  },
  {
    name: 'Zest Protocol',
    description: 'A borrowing and lending protocol on Stacks.',
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
    apps: [
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
    // Liquid stacking happens in the protocols' own apps
    apps: [
      { name: 'StackingDAO', href: stackingDaoApp, logo: logo('stacking-dao') },
      { name: 'LISA', href: lisaApp, logo: logo('lisa') },
    ],
  },
];

export const explorerDisclaimer =
  'Leather does not operate or manage any Stacking pools or liquid Stacking protocols. Users are responsible for evaluating the risks, terms, and smart contracts involved in any third-party options they access through Leather.';
