import { ReactNode } from 'react';

import { Box, TextProps } from '../../../native';
import { BulletSeparator as BulletSeparatorContainer } from './bullet-separator.shared';

interface BulletOperatorProps {
  color: TextProps['color'];
}

function BulletOperator({ color }: BulletOperatorProps) {
  return (
    <Box width={6} height={6} borderRadius="xs" backgroundColor={color} marginHorizontal="1" />
  );
}

interface BulletSeparatorSeparatorProps {
  children: ReactNode;
  color?: TextProps['color'];
}
export function BulletSeparator({
  children,
  color = 'ink.text-primary',
}: BulletSeparatorSeparatorProps) {
  return (
    <Box flexDirection="row" alignItems="center">
      <BulletSeparatorContainer operator={<BulletOperator color={color} />}>
        {children}
      </BulletSeparatorContainer>
    </Box>
  );
}
