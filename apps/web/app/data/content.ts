import type { PostsCollection } from './post-types';
import postsData from './posts.json';

export const content = {
  stackingExplainer: [
    {
      title: 'Get STX',
      postKey: 'stacking-amount',
      description: 'Hold at least the minimum required STX to participate.',
    },
    {
      title: 'APR',
      postKey: 'stacking-provider-apr',
      description: 'Pick a pool provider from the table below.',
    },
    {
      title: 'Next rewards',
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
