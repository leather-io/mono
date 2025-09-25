import { MetaDescriptor } from 'react-router';

import { cmsClient } from '~/constants/cms-client';
import { SbtcRewards } from '~/pages/sbtc-rewards/sbtc-rewards';

import {
  sbtcBasicEnrollQuery,
  sbtcConceptsQuery,
  sbtcFaqQuery,
  sbtcPoolsQuery,
} from '@leather.io/cms';

export async function loader() {
  const [sbtcPools, sbtcEnroll, sbtcFaq, sbtcConcepts] = await Promise.all([
    cmsClient.fetch(sbtcPoolsQuery),
    cmsClient.fetch(sbtcBasicEnrollQuery),
    cmsClient.fetch(sbtcFaqQuery),
    cmsClient.fetch(sbtcConceptsQuery),
  ]);

  const { historicalYield, minimumCommitment, rewardsToken, tvl } = sbtcConcepts;

  return {
    sbtcPools,
    sbtcEnroll,
    sbtcFaq,
    concepts: {
      tvlConcept: tvl,
      minimumCommitmentConcept: minimumCommitment,
      historicalYieldConcept: historicalYield,
      rewardsTokenConcept: rewardsToken,
    },
  };
}

export function meta() {
  return [
    { title: 'sBTC Rewards – Leather' },
    {
      name: 'description',
      content:
        'Earn sBTC yield through integrated DeFi protocols while maintaining control of your Bitcoin.',
    },
  ] satisfies MetaDescriptor[];
}

export default function SbtcRewardsRoute() {
  return <SbtcRewards />;
}
