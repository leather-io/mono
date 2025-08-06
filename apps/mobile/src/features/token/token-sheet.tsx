import { RefObject } from 'react';

import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { analytics } from '@/utils/analytics';

import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { SheetRef, useHaptics } from '@leather.io/ui/native';

import { getAssets } from '../receive/get-assets';
import { Token } from './token';

export interface TokenSheetData {
  accountIndex: number;
  fingerprint: string;
  asset: FungibleCryptoAsset;
  availableBalance: Money;
  quoteBalance: Money;
}

interface TokenSheetProps {
  data: TokenSheetData;
  sheetRef: RefObject<SheetRef | null>;
}

export function TokenSheet({ data, sheetRef }: TokenSheetProps) {
  const triggerHaptics = useHaptics();

  const account = useAccountByIndex(data.fingerprint, data.accountIndex);

  // Receive sheet expects full asset object  - replicating this here from address-list - needs to be refactored
  const { nativeSegwitPayerAddress, taprootPayerAddress } = useBitcoinPayerAddressFromAccountIndex(
    account?.fingerprint ?? '',
    account?.accountIndex ?? 0
  );
  const stxAddress = useStacksSignerAddressFromAccountIndex(
    account?.fingerprint ?? '',
    account?.accountIndex ?? 0
  );

  const assets = getAssets({
    nativeSegwitPayerAddress,
    taprootPayerAddress,
    stxAddress: stxAddress ?? '',
  });

  function handleAnimatedPositionChange(fromIndex: number, toIndex: number) {
    if (fromIndex === 0 && toIndex === -1) {
      void triggerHaptics('medium');
    }
  }

  function handleDismiss() {
    analytics.track('send_sheet_dismissed');
  }
  console.log('------------ data', data);
  return (
    <FullHeightSheet
      sheetRef={sheetRef}
      shouldHaveContainer={false}
      onAnimate={handleAnimatedPositionChange}
      onDismiss={handleDismiss}
    >
      {/* TODO LEA-3015: improve this / add fallback defensiveness */}
      {/* TODO - this sheet should open once then the content should slide in from the right 
      when we drill down to account specific content */}
      {data && (
        <Token
          asset={data.asset}
          receiveAssets={assets.find(asset => asset.symbol === data.asset.symbol)}
          accountIndex={data.accountIndex}
          fingerprint={data.fingerprint}
          availableBalance={data.availableBalance}
          quoteBalance={data.quoteBalance}
        />
      )}
    </FullHeightSheet>
  );
}
