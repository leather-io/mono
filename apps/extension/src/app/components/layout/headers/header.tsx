import { type BoxProps, styled } from 'leather-styles/jsx';

import type { HasChildren } from '@app/common/has-children';

export function Header({ children, ...props }: HasChildren & BoxProps) {
  return (
    <styled.header
      justifyContent="center"
      margin={[0, null, 'auto']}
      p="space.04"
      bg="transparent"
      maxWidth={['100vw', null, 'fullPageMaxWidth']}
      width="100%"
      {...props}
    >
      {children}
    </styled.header>
  );
}
