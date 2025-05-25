import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useBrowserFlag } from '@/features/feature-flags';
import { useWallets } from '@/store/wallets/wallets.read';
import { useSegments } from 'expo-router';

const allowedSegmentConditions: ((segments: ReturnType<typeof useSegments>) => boolean)[] = [
  ([rootSegment]) => rootSegment === undefined,
  ([rootSegment]) => rootSegment === 'account',
  ([rootSegment]) => rootSegment === 'balances',
];

export function useActionBar() {
  const { browserSheetRef, sendSheetRef, receiveSheetRef, addWalletSheetRef } = useGlobalSheets();
  const { hasWallets } = useWallets();
  const releaseBrowserFeature = useBrowserFlag();
  const segments = useSegments();
  const isActionBarVisible = allowedSegmentConditions.some(condition => condition(segments));

  function onAddWallet() {
    addWalletSheetRef.current?.present();
  }

  function onOpenSend() {
    sendSheetRef.current?.present();
  }

  function onOpenReceive() {
    receiveSheetRef.current?.present();
  }

  function onOpenBrowser() {
    browserSheetRef.current?.present();
  }

  return {
    hasWallets,
    onAddWallet,
    onOpenBrowser,
    onOpenSend,
    onOpenReceive,
    isBrowserEnabled: releaseBrowserFeature,
    isActionBarVisible,
  };
}
