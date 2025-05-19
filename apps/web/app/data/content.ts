import type { PostsCollection } from './post-types';
import postsData from './posts.json';

export const content = {
  stacking: {
    providerDescription:
      'Providers are external parties that offer yield-earning services based on the Proof of Transfer (PoX) protocol. Leather is not liable for the conduct of third parties.',
    payoutDescription:
      'The type of reward you\'ll receive from the pool — either BTC or STX — depending on the provider\'s configuration.',
    minimumAmountToStackDescription:
      '     The minimum amount of STX required to participate in this provider\'s pool. You cannot stack with less than this.',
    aprDescription:
      'APR (Annual Percentage Rate) represents the annualized return participants earn on their stacked assets, excluding compounding.',
    feeDescription:
      'The fee is a percentage of the rewards you earn from the pool. It is deducted from your rewards before they are distributed to you.',
    missingIndependentStackingDescription: `We're working hard to integrate independent stacking here. In the meantime, you can use our legacy earn experience.`,
    unpoolingInfo: `After unpooling your previous position remains visible until the current cycle completes.`,
  },
  stackingExplainer: [
    {
      title: 'Get STX',
      postKey: 'stacks-token-stx',
      description: 'Hold at least the minimum required STX to participate.',
    },
    {
      title: 'Choose a provider',
      postKey: 'stacking-providers',
      description: 'Pick a pool provider from the table below.',
    },
    {
      title: 'Delegate STX',
      postKey: 'pooled-stacking-delegation',
      description: 'Delegate your STX into the chosen pool for locking.',
    },
    {
      title: 'Rewards token',
      postKey: 'stacking-rewards-tokens',
      description: 'Receive regular rewards without lifting a finger.',
    },
  ],
  liquidStackingExplainer: [
    {
      title: 'Get STX',
      postKey: 'stacks-token-stx',
      description: 'Hold STX in your wallet, ready to swap.',
    },
    {
      title: 'Choose a provider',
      postKey: 'stacking-providers',
      description: 'Pick a provider from the table below.',
    },
    {
      title: 'Convert STX',
      postKey: 'stacking-liquid-token',
      description: 'Swap your STX to receive a liquid Stacking token.',
    },
    {
      title: 'Begin earning',
      postKey: 'stacking-rewards',
      description: 'Use your liquid Stacking token in DeFi and swap back anytime while earning.',
    },
  ],
  posts: postsData as PostsCollection,
} as const;

export async function fetchPostsFromCMS(): Promise<PostsCollection> {
  const res = await fetch('https://leather-cms.s3.amazonaws.com/posts.json');
  if (!res.ok) throw new Error('Failed to fetch posts.json');
  return res.json();
}
