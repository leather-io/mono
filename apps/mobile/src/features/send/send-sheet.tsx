import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useCurrentAccount } from '@/core/current-account-provider';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { Send } from '@/features/send/send';
import { analytics } from '@/utils/analytics';
import { useGlobalSearchParams } from 'expo-router';
import { isString } from 'remeda';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { FungibleCryptoAsset } from '@leather.io/models';
import { useHaptics } from '@leather.io/ui/native';
import { assertExistence } from '@leather.io/utils';

export function SendSheet() {
  const { sendSheetRef } = useGlobalSheets();
  const triggerHaptics = useHaptics();
  const { currentAccount } = useCurrentAccount();
  const { asset } = useInitialSendParams();
  assertExistence(currentAccount, `"Send Sheet expects currentAccount to be set`);

  function handleAnimatedPositionChange(fromIndex: number, toIndex: number) {
    if (fromIndex === 0 && toIndex === -1) {
      void triggerHaptics('medium');
    }
  }

  function handleDismiss() {
    analytics.track('send_sheet_dismissed');
  }

  return (
    <FullHeightSheet
      sheetRef={sendSheetRef}
      onAnimate={handleAnimatedPositionChange}
      onDismiss={handleDismiss}
    >
      <Send currentAccount={currentAccount} asset={asset} />
    </FullHeightSheet>
  );
}

function useInitialSendParams() {
  const params = useGlobalSearchParams();
  const accountId = isString(params.accountId) ? params.accountId : undefined;
  const tokenId = isString(params.tokenId) ? params.tokenId : undefined;
  // FIXME LEA-3125: we need to refactor this so we can also send SIP-10 tokens
  const asset: FungibleCryptoAsset = tokenId === 'BTC' ? btcAsset : stxAsset;

  return { accountId, asset };
}
