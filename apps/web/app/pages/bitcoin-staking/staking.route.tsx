import { MetaDescriptor } from 'react-router';

import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { Staking } from '~/pages/bitcoin-staking/staking';

export function meta() {
  return [
    { title: 'Bitcoin Staking – Leather' },
    { name: 'description', content: 'Bitcoin for the rest of us' },
  ] satisfies MetaDescriptor[];
}

export default function StakingRoute() {
  return (
    <StackingClientProvider>
      <Staking />
    </StackingClientProvider>
  );
}
