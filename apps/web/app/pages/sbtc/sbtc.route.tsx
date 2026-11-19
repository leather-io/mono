import { type MetaDescriptor } from 'react-router';

import { SbtcRewards } from '~/pages/sbtc/sbtc-rewards';

export function meta() {
  return [
    { title: 'sBTC Rewards – Leather' },
    {
      name: 'description',
      content:
        'Explore independent sBTC providers on Stacks and compare their strategies, reward tokens and current terms.',
    },
  ] satisfies MetaDescriptor[];
}

export default function SbtcRewardsRoute() {
  return <SbtcRewards />;
}
