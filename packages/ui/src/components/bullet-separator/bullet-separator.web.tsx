import { ReactNode } from 'react';

import { Circle } from 'leather-styles/jsx';

import { BulletSeparator as BulletSeparatorContainer } from './bullet-separator.shared';

function BulletOperator() {
  return (
    <Circle
      display="inline-block"
      verticalAlign="middle"
      bg="currentColor"
      size="3px"
      // Visual adjustment for correct centering on retina displays
      transform="translateY(-0.5px)"
    />
  );
}

interface BulletSeparatorSeparatorProps {
  children: ReactNode;
}
export function BulletSeparator({ children }: BulletSeparatorSeparatorProps) {
  return (
    <BulletSeparatorContainer operator={<BulletOperator />}>{children}</BulletSeparatorContainer>
  );
}
