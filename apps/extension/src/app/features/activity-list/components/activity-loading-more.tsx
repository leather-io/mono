import { Flex } from 'leather-styles/jsx';

import { Spinner } from '@leather.io/ui';

export function ActivityLoadingMore() {
  return (
    <Flex justifyContent="center" py="space.04">
      <Spinner />
    </Flex>
  );
}
