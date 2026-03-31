import { Flex, styled } from 'leather-styles/jsx';

import type { HasChildren } from '@app/common/has-children';

export function ContainerLayout({ children }: HasChildren) {
  return (
    <Flex flexDirection="column" flexGrow={1} width="100%" height={{ base: '100vh', sm: '100%' }}>
      {children}
      <styled.span
        display={['none', null, null, 'block']}
        position="fixed"
        bottom="space.01"
        left="space.01"
        opacity={0.3}
        fontSize="8px"
        color="white"
        mixBlendMode="difference"
        userSelect="none"
        pointerEvents="none"
      >
        {VERSION}
      </styled.span>
    </Flex>
  );
}
