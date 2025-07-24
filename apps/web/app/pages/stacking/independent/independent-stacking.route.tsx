import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { IndependentStacking } from '~/pages/stacking/independent/independent-stacking';

export default function IndependentStackingRoute() {
  return (
    <StackingClientProvider>
      <IndependentStacking />
    </StackingClientProvider>
  );
}
