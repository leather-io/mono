import { styled } from 'leather-styles/jsx';

import { Spinner } from '@leather.io/ui';

export function CollectiblesLoading() {
  return (
    <styled.div display="flex" justifyContent="center" py="space.05">
      <Spinner />
    </styled.div>
  );
}
