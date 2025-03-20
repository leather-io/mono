import { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { Box } from '@leather.io/ui/native';

import { URL_SEARCH_HEIGHT } from '../utils';

interface BrowserTabLayoutProps {
  children: ReactNode;
}

export function BrowserTabSheetLayout({ children }: BrowserTabLayoutProps) {
  const { bottom } = useSafeAreaInsets();
  return (
    <BottomSheetScrollView contentInset={{ bottom: bottom + URL_SEARCH_HEIGHT }}>
      <Box flex={1} px="5" py="2">
        {children}
      </Box>
    </BottomSheetScrollView>
  );
}
