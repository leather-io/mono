import { Flex } from 'leather-styles/jsx';

import type { HasChildren } from '@app/common/has-children';

export function ContainerLayout({ children }: HasChildren) {
  return (
    <Flex flexDirection="column" flexGrow={1} width="100%" height={['100vh', '100%']}>
      {children}
    </Flex>
  );
}
