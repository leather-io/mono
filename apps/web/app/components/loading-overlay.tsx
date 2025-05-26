import { Flex, FlexProps } from 'leather-styles/jsx';

import { LoadingSpinner } from '@leather.io/ui';

export function LoadingOverlay(flexProps: FlexProps) {
  return (
    <Flex height="100vh" width="100%" {...flexProps}>
      <LoadingSpinner />
    </Flex>
  );
}
