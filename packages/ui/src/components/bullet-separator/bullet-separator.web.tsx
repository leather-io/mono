import { ReactNode } from 'react';

import { Box, BoxProps, Circle } from 'leather-styles/jsx';
import { SpacingToken } from 'leather-styles/tokens';

import { BulletSeparator as BulletSeparatorContainer } from './bullet-separator.shared';

function BulletOperator(props: BoxProps) {
  return (
    <Box display="inline-block" verticalAlign="middle" {...props}>
      <Circle
        bg="currentColor"
        size="3px"
        // Visual adjustment for correct centering on retina displays
        transform="translateY(-0.5px)"
      />
    </Box>
  );
}

interface BulletSeparatorSeparatorProps {
  children: ReactNode;
  spacing?: SpacingToken;
}
export function BulletSeparator({ children, spacing }: BulletSeparatorSeparatorProps) {
  return (
    <BulletSeparatorContainer operator={<BulletOperator px={spacing} />}>
      {children}
    </BulletSeparatorContainer>
  );
}
