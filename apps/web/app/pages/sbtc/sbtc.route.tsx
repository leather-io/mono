import { MetaDescriptor } from 'react-router';

import { SbtcRewards } from '~/pages/sbtc/sbtc';
import { formatPostPrompt, getPosts } from '~/utils/post-utils';

export function meta() {
  const posts = getPosts();
  return [
    { title: 'sBTC Rewards – Leather' },
    {
      name: 'description',
      content: formatPostPrompt(posts.sbtcRewardsBasic?.prompt || ''),
    },
  ] satisfies MetaDescriptor[];
}

export default function SbtcRewardsRoute() {
  return <SbtcRewards />;
}
