import postsData from './posts.json';
import type { PostsCollection } from './post-types';

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
  },
  posts: postsData as PostsCollection,
} as const;
