import { Flex } from 'leather-styles/jsx';

import { LoadingSpinner } from '@leather.io/ui';

export function PortfolioTableLoading() {
  return (
    <Flex p="space.06" textAlign="center" fontSize="24px" height="360px" justifyContent="center">
      <LoadingSpinner />
    </Flex>
  );
}
