import { ReactNode, RefObject, createContext, forwardRef, useContext, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import Inbox from '@/assets/inbox.svg';
import PaperPlane from '@/assets/paper-plane.svg';
import Plus from '@/assets/plus-icon.svg';
import Swap from '@/assets/swap.svg';
import { ActionBar, ActionBarMethods } from '@/components/action-bar';
import { APP_ROUTES } from '@/constants';
import { useWallets } from '@/state/wallets/wallets.slice';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Trans, t } from '@lingui/macro';
import { useRouter } from 'expo-router';

import { Text, TouchableOpacity } from '@leather.io/ui/native';
import { isEmptyArray } from '@leather.io/utils';

import { AddWalletModal } from '../add-wallet/add-wallet-modal';

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
const isCloseToBottom = (
  { layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent,
  contentOffsetBottom: number
) => {
  const paddingToBottom = scrollPaddingBottom;
  return (
    layoutMeasurement.height + contentOffset.y - contentOffsetBottom >=
    contentSize.height - paddingToBottom
  );
};

/**
 *
 * Check if FlatList is scrollPaddingTop pixels off the top
 *
 * @param nativeEvent
 * @returns boolean
 */
const isCloseToTop = ({ contentOffset }: NativeScrollEvent, contentOffsetTop: number) => {
  const paddingToTop = scrollPaddingTop;

  return contentOffset.y <= -contentOffsetTop + paddingToTop;
};

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
  label: string;
}
function ActionBarButton({ onPress, icon, label }: ActionBarButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      justifyContent="center"
      alignItems="center"
      flex={1}
      height="100%"
      flexDirection="row"
      gap="2"
    >
      {icon}
      <Text variant="label02">
        <Trans>{label}</Trans>
      </Text>
    </TouchableOpacity>
  );
}

export const ActionBarContainer = forwardRef<ActionBarMethods>((_, ref) => {
  const router = useRouter();
  const wallets = useWallets();
  const addWalletModalRef = useRef<BottomSheetModal>(null);

  const actionBar = isEmptyArray(wallets.list) ? (
    <ActionBar
      ref={ref}
      center={
        <ActionBarButton
          onPress={() => addWalletModalRef.current?.present()}
          icon={<Plus width={24} height={24} />}
          label={t`Add Wallet`}
        />
      }
    />
  ) : (
    <ActionBar
      ref={ref}
      left={
        <ActionBarButton
          onPress={() => router.navigate(APP_ROUTES.WalletSend)}
          icon={<PaperPlane width={24} height={24} />}
          label={t`Send`}
        />
      }
      center={
        <ActionBarButton
          onPress={() => router.navigate(APP_ROUTES.WalletReceive)}
          icon={<Inbox width={24} height={24} />}
          label={t`Receive`}
        />
      }
      right={
        <ActionBarButton
          onPress={() => router.navigate(APP_ROUTES.WalletSwap)}
          icon={<Swap width={24} height={24} />}
          label={t`Swap`}
        />
      }
    />
  );

  return (
    <>
      {actionBar}
      <AddWalletModal addWalletModalRef={addWalletModalRef} />
    </>
  );
});
