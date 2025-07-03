import { ReactNode } from 'react';

import { Box, type BoxProps } from '../../box/box.native';
import { Text } from '../../text/text.native';

interface ApproverSubheaderProps extends BoxProps {
  children: ReactNode;
  icon?: ReactNode;
}

export function ApproverSubheader({ children, icon, ...props }: ApproverSubheaderProps) {
  return (
    <Box flexDirection="row" gap="1" alignItems="center" {...props}>
      {icon}
      <Text py="3" variant="label03">
        {children}
      </Text>
    </Box>
  );
}
