import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ActionBarContainer,
  ActionBarContext,
  createOnScrollHandler,
} from '@/components/action-bar/container';
import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

import { ACTION_BAR_TOTAL_HEIGHT, ActionBarMethods } from '../action-bar';
import { Earn } from './earn';
import { MyAccounts } from './my-accounts';

export function Home() {
  const { bottom, top } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const actionBarRef = useRef<ActionBarMethods>(null);
  const contentOffsetBottom = bottom + ACTION_BAR_TOTAL_HEIGHT;
  const contentOffsetTop = top;

  return (
    <ActionBarContext.Provider value={{ ref: actionBarRef }}>
      <Box flex={1} bg="base.ink.background-primary">
        <ScrollView
          onScroll={createOnScrollHandler({
            actionBarRef,
            contentOffsetTop,
            contentOffsetBottom,
          })}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing['5'],
            paddingTop: theme.spacing['5'],
            paddingBottom: theme.spacing['5'],
            gap: theme.spacing[3],
          }}
          contentInset={{ bottom: contentOffsetBottom }}
        >
          <MyAccounts />
          <Earn />
        </ScrollView>
      </Box>
      <ActionBarContainer ref={actionBarRef} />
    </ActionBarContext.Provider>
  );
}
