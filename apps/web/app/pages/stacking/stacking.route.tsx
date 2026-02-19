import { MetaDescriptor } from 'react-router';

import { canonicalUrl } from '~/constants/meta-tags';
import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { Stacking } from '~/pages/stacking/stacking';

export function meta() {
  return [
    { title: 'Stacking – Leather' },
    { name: 'description', content: 'Bitcoin for the rest of us' },
    canonicalUrl('/stacking'),
  ] satisfies MetaDescriptor[];
}

export default function HomeRoute() {
  return (
    <StackingClientProvider>
      <Stacking />
    </StackingClientProvider>
  );
}
