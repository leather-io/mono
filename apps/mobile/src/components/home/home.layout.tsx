import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ActionBarContainer,
  ActionBarContext,
  createOnScrollHandler,
} from '@/components/action-bar/container';

import { Box } from '@leather.io/ui/native';

import { ACTION_BAR_TOTAL_HEIGHT, ActionBarMethods } from '../action-bar';

interface HomeLayoutProps {
  children: React.ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
  const { bottom, top } = useSafeAreaInsets();
  const actionBarRef = useRef<ActionBarMethods>(null);
  const contentOffsetBottom = bottom + ACTION_BAR_TOTAL_HEIGHT;
  const contentOffsetTop = top;

  return (
    <ActionBarContext.Provider value={{ ref: actionBarRef }}>
      <Box flex={1} bg="ink.background-primary">
        <ScrollView
          onScroll={createOnScrollHandler({
            actionBarRef,
            contentOffsetTop,
            contentOffsetBottom,
          })}
          contentInset={{ bottom: contentOffsetBottom }}
        >
          {children}
        </ScrollView>
      </Box>
      <ActionBarContainer ref={actionBarRef} />
    </ActionBarContext.Provider>
  );
}
