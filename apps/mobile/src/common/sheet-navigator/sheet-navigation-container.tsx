import { useWindowDimensions } from 'react-native';

import { ToastWrapper } from '@/components/toast/toast-context';
import { HasChildren } from '@/utils/types';
import { NavigationContainer } from '@react-navigation/native';

import { Box } from '@leather.io/ui/native';

export function SheetNavigationContainer({ children }: HasChildren) {
  const { height } = useWindowDimensions();
  return (
    <ToastWrapper>
      <Box flex={1} height={height}>
        <NavigationContainer independent>{children}</NavigationContainer>
      </Box>
    </ToastWrapper>
  );
}
