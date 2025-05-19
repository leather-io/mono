import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useBrowserFlag } from '@/features/feature-flags';
import { AppRoutes } from '@/routes';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLocalSearchParams, usePathname, useSegments } from 'expo-router';

const allowedSegmentConditions: ((segments: ReturnType<typeof useSegments>) => boolean)[] = [
  ([rootSegment]) => rootSegment === undefined,
  ([rootSegment]) => rootSegment === 'account',
  ([rootSegment]) => rootSegment === 'balances',
];

export function useActionBar() {
  const { browserSheetRef, sendSheetRef, receiveSheetRef } = useGlobalSheets();
  const { hasWallets } = useWallets();
  const releaseBrowserFeature = useBrowserFlag();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const segments = useSegments();
  const isActionBarVisible = allowedSegmentConditions.some(condition => condition(segments));

  function getAccountIdIfOnAccountPage() {
    return pathname === AppRoutes.Account ? params.accountId : undefined;
  }

  function onOpenSend() {
    sendSheetRef.current?.present({
      accountId: getAccountIdIfOnAccountPage(),
    });
  }

  function onOpenReceive() {
    receiveSheetRef.current?.present();
  }

  function onOpenBrowser() {
    browserSheetRef.current?.present();
  }

  return {
    hasWallets,
    onOpenBrowser,
    onOpenSend,
    onOpenReceive,
    isBrowserEnabled: releaseBrowserFeature,
    isActionBarVisible,
  };
}
