import { ReactNode } from 'react';

import { Box, BoxProps } from '../box/box.native';
import { TextProps } from '../text/text.native';
import { BulletSeparator as BulletSeparatorContainer } from './bullet-separator.shared';

interface BulletOperatorProps {
  color?: TextProps['color'];
  borderRadius?: BoxProps['borderRadius'];
}

export function BulletOperator({
  color = 'ink.text-primary',
  borderRadius = 'xs',
}: BulletOperatorProps) {
  return (
    <Box
      width={6}
      height={6}
      borderRadius={borderRadius}
      backgroundColor={color}
      marginHorizontal="1"
    />
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
