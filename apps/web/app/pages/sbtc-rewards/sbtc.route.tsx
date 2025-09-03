import { MetaDescriptor } from 'react-router';

import { SbtcRewards } from '~/pages/sbtc-rewards/sbtc-rewards';
import { formatPostPrompt, getPosts } from '~/utils/post-utils';

import { client, sbtcBasicEnrollQuery, sbtcPoolsQuery } from '@leather.io/cms';

export async function loader() {
  const sbtcPools = await client.fetch(sbtcPoolsQuery);
  const sbtcEnroll = await client.fetch(sbtcBasicEnrollQuery);
  return { sbtcPools, sbtcEnroll };
}

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
