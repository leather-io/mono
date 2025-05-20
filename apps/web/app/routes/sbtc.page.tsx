import { MetaDescriptor } from 'react-router';

import { SbtcRewards } from '~/pages/sbtc-rewards/sbtc-rewards';
import { content } from '~/data/content';
import { formatPostPrompt } from '~/utils/post-utils';

export function meta() {
  return [
    { title: 'sBTC Rewards – Leather' },
    {
      name: 'description',
      content: formatPostPrompt(content.posts["sbtc-rewards-basic"]?.Prompt || ''),
    },
  ] satisfies MetaDescriptor[];
}

export default function SbtcRewardsRoute() {
  return <SbtcRewards />;
}
