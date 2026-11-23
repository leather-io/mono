import { sbtcContent } from '~/content/sbtc-content';

// The /sbtc page content, moved into the repo from the retired Sanity CMS.

export interface SbtcPool {
  id: string;
  title: string;
  description: string;
  url: string;
  payoutToken: string;
  /** Slug of the legacy post behind the "Learn more" link */
  learnMoreSlug: string;
  /** 32×32 logo served from /public */
  logo: string;
}

interface SbtcFaqItem {
  /** Slug of the legacy post behind the "Learn more" link; also the item's key */
  slug: string;
  question: string;
  answer: string;
}

interface SbtcConcept {
  name: string;
  description: string;
  /** Slug of the legacy post the hover card links to */
  slug: string;
}

export const sbtcPools: SbtcPool[] = [
  {
    id: 'zest',
    title: 'Zest',
    description:
      'Use your sBTC to earn Bitcoin yield through decentralized lending pools on Zest. ',
    url: 'https://app.zestprotocol.com',
    payoutToken: 'sBTC',
    learnMoreSlug: 'zest-sbtc-pools',
    logo: '/images/sbtc/zest-logo.svg',
  },
  {
    id: 'bitflow',
    title: 'Bitflow',
    description: 'Stake sBTC in Bitflow liquidity routes to earn Bitcoin-backed yield.',
    url: 'https://app.bitflow.finance/sbtc#earn3',
    payoutToken: 'sBTC',
    learnMoreSlug: 'bitflow-sbtc-pools',
    logo: '/images/sbtc/bitflow-logo.png',
  },
];

export const rewardsTokenConcept: SbtcConcept = {
  name: 'Rewards Token',
  description:
    'sBTC rewards can include BTC, STX, sBTC itself, or protocol-native tokens depending on the platform.',
  slug: 'sbtc-rewards-tokens',
};

// The first answer follows the rewards sunset copy, which replaced the CMS answer's outdated date.
export const sbtcFaq: SbtcFaqItem[] = [
  {
    slug: 'sbtc-rewards-basic',
    question: 'What happened to basic sBTC rewards?',
    answer: `${sbtcContent.rewardsSunset.title}. ${sbtcContent.rewardsSunset.description}`,
  },
  {
    slug: 'total-locked-value-tvl',
    question: 'What is Total Value Locked (TVL) on Stacks?',
    answer:
      'Total Value Locked (TVL) is a key metric that measures how much value is currently committed to DeFi protocols on the Stacks blockchain. It includes assets like STX and sBTC locked for Stacking, sBTC rewards, liquidity provision, lending, or other yield strategies.\n\nWith the rise of sBTC reward programs and liquidity incentives, TVL now reflects broader participation across protocols like ALEX, Velar, Zest, Bitflow, and Stacking DAO. Leather highlights TVL (when available) to help users gauge traction, capital flow, and where earning opportunities are concentrated.',
  },
  {
    slug: 'historical-yield',
    question:
      'What is historical yield (APY or APR), and how can it help me choose between BTC, sBTC, or STX-earning strategies on Stacks?',
    answer:
      "Historical yield (APY or APR) reflects the actual returns earned from past participation in Stacking and other yield-generating activities on the Stacks network. Depending on the protocol, this may include rewards in BTC, STX, sBTC, or other tokens. APY accounts for compounding, while APR shows a flat annualized rate.\n\nLeather displays historical yield data across pooled Stacking, liquid Stacking, and DeFi protocols—giving users a clear view of past performance to help guide their choices. Whether you're earning Bitcoin through PoX or tokens via DeFi strategies, historical yield helps you understand what’s worked before committing STX or other assets.",
  },
  {
    slug: 'sbtc-bridge',
    question: 'What is the sBTC bridge for Stacks?',
    answer:
      'The sBTC bridge is a decentralized mechanism that connects the Bitcoin and Stacks blockchains. By locking BTC on the Bitcoin base layer, users can mint an equivalent amount of sBTC on Stacks—a Bitcoin-backed asset that supports programmable features like lending, yield, and swaps.\n\nLeather integrates with the sBTC bridge so users can send native BTC and receive sBTC in return, enabling Bitcoin-secured DeFi directly from their wallet.',
  },
  {
    slug: 'stacks-swaps',
    question: 'What are token swaps on Stacks?',
    answer:
      'Swaps on Stacks are decentralized token trades executed through smart contracts on the Stacks blockchain. They enable permissionless exchange of assets like STX, sBTC, ALEX, USDA, and more—no intermediaries, no custodians.\n\nWith Leather, users can access swap functionality directly in the wallet or by connecting to DeFi protocols like ALEX, enabling seamless participation in Bitcoin-secured trading and liquidity.',
  },
  {
    slug: 'alex-sbtc-pools',
    question: 'What are ALEX sBTC Pools?',
    answer:
      'ALEX is a DeFi protocol on Stacks that supports sBTC-focused yield strategies. Users can deposit sBTC into designated pools that support liquidity, lending, or incentive programs tied to Bitcoin-backed assets.\n\nThrough Leather, you can connect to ALEX and participate in these pools directly—putting your sBTC to work in a smart contract-powered, Bitcoin-secured ecosystem.',
  },
  {
    slug: 'bitflow-sbtc-pools',
    question: 'What are liquidity pools on Bitflow with sBTC?',
    answer:
      'Bitflow is a decentralized trading aggregator on Stacks where users can earn real Bitcoin yield by supplying sBTC to liquidity pools. These pools enable swaps, optimize routes across other DEXs, and return rewards in sBTC or BTC.\n\nLeather will integrate with Bitflow to help users view LP positions, track yield, and manage their sBTC strategies easily.',
  },
  {
    slug: 'velar-sbtc-pools',
    question: 'What are liquidity pools on Velar with sBTC?',
    answer:
      'Velar is a DeFi liquidity protocol built on Bitcoin via Stacks that enables users to provide sBTC liquidity into decentralized pools. These pools support swaps and trading on Velar Dharma (AMM) and Velar Artha (perps), with users earning yield through fees and token rewards.\n\nLeather will support Velar integrations to make sBTC liquidity provisioning and position tracking seamless for wallet users.',
  },
  {
    slug: 'sbtc-rewards-minimum-commitment',
    question: 'What is the minimum commitment required to earn sBTC rewards?',
    answer:
      'To earn rewards with sBTC, many DeFi protocols require users to commit a minimum amount. This threshold is set by the protocol—not by Leather—and can vary depending on the strategy, market, or reward structure.\n\nThese minimums are typically in place to ensure efficient smart contract usage and fair reward distribution. Users interacting with sBTC strategies via Leather will see the required minimums in the interface before committing their funds. Committing less than the required amount may result in no rewards being issued.',
  },
  {
    slug: 'sbtc-rewards-tokens',
    question: 'What kinds of tokens do you earn through sBTC strategies?',
    answer:
      'When you use sBTC in DeFi apps like ALEX, Zest, Bitflow, or Velar, the tokens you earn in return can vary. Most commonly, rewards are paid in sBTC, STX, BTC, or the platform’s own token, like ALEX.\n\nEach protocol defines its own incentive model based on liquidity needs, lending activity, or strategic growth goals. Leather helps you discover and manage these strategies—but doesn’t distribute or control the rewards themselves.',
  },
];
