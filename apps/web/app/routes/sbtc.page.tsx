import { MetaDescriptor } from 'react-router';

import { SbtcRewards } from '~/pages/sbtc-rewards/sbtc-rewards';

export function meta() {
  return [
    { title: 'sBTC Rewards – Leather' },
    {
      name: 'description',
      content: `Earn rewards by providing liquidity to the sBTC pool via Leather`,
    },
  ] satisfies MetaDescriptor[];
}

export default function SbtcRewardsRoute() {
  return <SbtcRewards />;
}
