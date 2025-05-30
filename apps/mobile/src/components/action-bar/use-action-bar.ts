import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useBrowserFlag } from '@/features/feature-flags';
import { useWallets } from '@/store/wallets/wallets.read';
import { analytics } from '@/utils/analytics';
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
    analytics.track('add_wallet_sheet_opened', { source: 'action_bar' });
    addWalletSheetRef.current?.present();
  }

  function onOpenSend() {
    analytics.track('send_sheet_opened', { source: 'action_bar' });
    sendSheetRef.current?.present();
  }

  function onOpenReceive() {
    analytics.track('receive_sheet_opened', { source: 'action_bar' });
    receiveSheetRef.current?.present();
  }

  function onOpenBrowser() {
    analytics.track('browser_sheet_opened', { source: 'action_bar' });
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
