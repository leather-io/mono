import { ReactNode, RefObject, createContext, forwardRef, useContext, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { ActionBar, ActionBarMethods } from '@/components/action-bar/action-bar';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useBrowserFlag } from '@/features/feature-flags';
import { TestId } from '@/shared/test-id';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';

import {
  Box,
  BrowserIcon,
  InboxIcon,
  PaperPlaneIcon,
  PlusIcon,
  Pressable,
  SheetRef,
  Text,
  legacyTouchablePressEffect,
  useOnMount,
} from '@leather.io/ui/native';
import { isEmptyArray } from '@leather.io/utils';

import { AddWalletSheet } from '../add-wallet';

const scrollUntilClosed = 50;
const scrollPaddingBottom = 50;
const scrollPaddingTop = 20;

/**
 *
 * Check if FlatList is scrollPaddingBottom pixels off the bottom
 *
 * @param nativeEvent
 * @returns boolean
 */
function isCloseToBottom(
  { layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent,
  contentOffsetBottom: number
) {
  const paddingToBottom = scrollPaddingBottom;
  return (
    layoutMeasurement.height + contentOffset.y - contentOffsetBottom >=
    contentSize.height - paddingToBottom
  );
}

/**
 *
 * Check if FlatList is scrollPaddingTop pixels off the top
 *
 * @param nativeEvent
 * @returns boolean
 */
function isCloseToTop({ contentOffset }: NativeScrollEvent, contentOffsetTop: number) {
  const paddingToTop = scrollPaddingTop;

  return contentOffset.y <= -contentOffsetTop + paddingToTop;
}

export function createOnScrollHandler({
  actionBarRef,
  contentOffsetTop,
  contentOffsetBottom,
}: {
  actionBarRef: RefObject<ActionBarMethods> | null;
  contentOffsetTop: number;
  contentOffsetBottom: number;
}) {
  let savedYOffset: number | null = null;
  return function onScrollHandler(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (actionBarRef === null) {
      return;
    }

    const yOffset = event.nativeEvent.contentOffset.y;
    const isShown = actionBarRef?.current?.isShown;

    // Uninitialized savedYOffset, set it to yOffset
    if (savedYOffset === null) {
      savedYOffset = yOffset;
      return;
    }
    // If the list is close to top, show the action bar.
    if (isCloseToTop(event.nativeEvent, contentOffsetTop)) {
      actionBarRef?.current?.show();
      savedYOffset = yOffset;
      return;
    }
    // If the list is close to bottom, show the action bar.
    if (isCloseToBottom(event.nativeEvent, contentOffsetBottom)) {
      actionBarRef?.current?.show();
      return;
    }
    // If the list scrolled more than scrollUntilClosed pixels after last save, hide action bar
    if (yOffset - savedYOffset > scrollUntilClosed) {
      savedYOffset = yOffset;
      if (isShown) {
        actionBarRef?.current?.hide();
      }
      return;
    }
    // If the list has scrolled even a bit up, show the action bar
    if (yOffset - savedYOffset < 0) {
      savedYOffset = yOffset;
      if (!isShown) {
        actionBarRef?.current?.show();
      }
      return;
    }
    // If the action bar is currently hidden, update savedYOffset
    if (!isShown) {
      savedYOffset = yOffset;
    }
  };
}

export const ActionBarContext = createContext<{ ref: RefObject<ActionBarMethods> | null }>({
  ref: null,
});

export function useActionBarContext() {
  return useContext(ActionBarContext);
}

interface ActionBarButtonProps {
  onPress: () => void;
  icon: ReactNode;
  label?: string;
  testID?: string;
}
function ActionBarButton({ onPress, icon, label, testID }: ActionBarButtonProps) {
  return (
    <Box flex={1} flexDirection="row" justifyContent="center" alignItems="center">
      <Pressable
        onPress={onPress}
        justifyContent="center"
        alignItems="center"
        flex={1}
        height="100%"
        flexDirection="row"
        gap="2"
        pressEffects={legacyTouchablePressEffect}
        haptics="soft"
        testID={testID}
      >
        {icon}
        {label && <Text variant="label02">{label}</Text>}
      </Pressable>
    </Box>
  );
}

export const ActionBarContainer = forwardRef<ActionBarMethods>((_, ref) => {
  const { browserSheetRef, sendSheetRef, receiveSheetRef } = useGlobalSheets();
  const wallets = useWallets();
  const addWalletSheetRef = useRef<SheetRef>(null);
  const browserRef = useRef<SheetRef>(null);
  const releaseBrowserFeature = useBrowserFlag();

  useOnMount(() => {
    browserRef.current?.present();
  });

  if (isEmptyArray(wallets.list)) {
    return (
      <ActionBar ref={ref}>
        <ActionBarButton
          onPress={() => addWalletSheetRef.current?.present()}
          icon={<PlusIcon />}
          label={t({
            id: 'action_bar.add_wallet_label',
            message: 'Add Wallet',
          })}
          testID={TestId.homeAddWalletButton}
        />
        <AddWalletSheet opensFully addWalletSheetRef={addWalletSheetRef} />
      </ActionBar>
    );
  }

  return (
    <ActionBar ref={ref}>
      <ActionBarButton onPress={() => sendSheetRef.current?.present()} icon={<PaperPlaneIcon />} />
      <ActionBarButton onPress={() => receiveSheetRef.current?.present()} icon={<InboxIcon />} />
      {releaseBrowserFeature && (
        <ActionBarButton
          onPress={() => {
            browserSheetRef.current?.present();
          }}
          icon={<BrowserIcon />}
        />
      )}
    </ActionBar>
  );
});

ActionBarContainer.displayName = 'ActionBarContainer';
