import { ReactNode } from 'react';
import { Dimensions } from 'react-native';

import { Box } from '@leather.io/ui/native';

const { height } = Dimensions.get('window');

export function ApproverWrapper({ children }: { children: ReactNode }) {
  return (
    <Box flex={1} maxHeight={height} backgroundColor="ink.background-secondary">
      {children}
    </Box>
  );
}
