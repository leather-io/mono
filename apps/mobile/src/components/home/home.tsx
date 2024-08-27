import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ActionBarContainer,
  ActionBarContext,
  createOnScrollHandler,
} from '@/components/action-bar/container';
import { useLingui } from '@lingui/react';
import { useTheme } from '@shopify/restyle';

import { Box, Sheet, Theme } from '@leather.io/ui/native';

import { ACTION_BAR_TOTAL_HEIGHT, ActionBarMethods } from '../action-bar';
import { Earn } from './earn';
import { MyAccounts } from './my-accounts';

export function Home() {
  // connect this component to changes in i18n locale
  useLingui();
  const { bottom, top } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const actionBarRef = useRef<ActionBarMethods>(null);
  const contentOffsetBottom = bottom + ACTION_BAR_TOTAL_HEIGHT;
  const contentOffsetTop = top;

  return (
    <ActionBarContext.Provider value={{ ref: actionBarRef }}>
      <Box flex={1} bg="ink.background-primary">
        <Sheet
          onScroll={createOnScrollHandler({
            actionBarRef,
            contentOffsetTop,
            contentOffsetBottom,
          })}
          contentContainerStyle={{
            paddingTop: theme.spacing['5'],
            paddingBottom: theme.spacing['5'],
            gap: theme.spacing[3],
          }}
          contentInset={{ bottom: contentOffsetBottom }}
        >
          <MyAccounts />
          <Box px="5">
            <Earn />
          </Box>
        </Sheet>
      </Box>
      <ActionBarContainer ref={actionBarRef} />
    </ActionBarContext.Provider>
  );
}
