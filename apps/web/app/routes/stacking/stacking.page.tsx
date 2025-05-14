import { MetaDescriptor } from 'react-router';

import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { Stacking } from '~/pages/stacking/stacking';

export function meta() {
  return [
    { title: 'Stacking – Leather' },
    { name: 'description', content: 'Bitcoin for the rest of us' },
  ] satisfies MetaDescriptor[];
}

export default function HomeRoute() {
  return (
    <StackingClientProvider>
      <Stacking />
    </StackingClientProvider>
  );
}
