import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { Stacking } from '~/pages/earn/stacking';

import { delay } from '@leather.io/utils';

import type { Route } from './+types/stacking';

export async function loader() {
  await delay(400);
  return true;
}

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [{ title: 'Leather Earn - Stacking' }];
}

export default function EarnStackingRoute() {
  return (
    <StackingClientProvider>
      <Stacking />
    </StackingClientProvider>
  );
}
