import { Flex, type FlexProps, styled } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';

import type { HasChildren } from '../../utils/has-children.shared';

const fadeHeight = 24;

export type StickyFooterProps = FlexProps & HasChildren;

export function StickyFooter({ children, ...props }: StickyFooterProps) {
  return (
    <Flex position="sticky" bottom={0} background="ink.background-primary" width="100%" {...props}>
      <styled.div
        aria-hidden
        style={{
          position: 'absolute',
          top: `-${fadeHeight}px`,
          left: 0,
          right: 0,
          height: `${fadeHeight}px`,
          pointerEvents: 'none',
          background: `linear-gradient(180deg, transparent, ${token(
            'colors.ink.background-primary'
          )})`,
        }}
      />
      {children}
    </Flex>
  );
}
