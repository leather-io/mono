import { styled } from 'leather-styles/jsx';
import { Page } from '~/components/page';
import { StartPooledStacking } from '~/features/stacking/start-pooled-stacking';

export function Stacking() {
  return (
    <Page>
      <styled.h1>Earn - Stacking</styled.h1>
      <styled.h2 textStyle="heading.05">Stack in a pool</styled.h2>
      <StartPooledStacking />
    </Page>
  );
}
