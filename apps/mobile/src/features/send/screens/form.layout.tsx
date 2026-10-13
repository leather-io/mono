import { BtcForm } from '@/features/send/forms/btc/btc-form';
import { BtcDataLoader } from '@/features/send/forms/btc/btc-loader';
import { StxForm } from '@/features/send/forms/stx/stx-form';
import { StxDataLoader } from '@/features/send/forms/stx/stx-loader';
import { useSettings } from '@/store/settings/settings';

import { AccountId, FungibleCryptoAsset } from '@leather.io/models';

import { Sip10Form } from '../forms/stx/sip10-form';
import { Sip10DataLoader } from '../forms/stx/sip10-loader';

interface FormLayoutProps {
  selectedAsset: FungibleCryptoAsset;
  currentAccount: AccountId;
  handleOpenAssetPicker(): void;
  assetItemElementInitialOffset: number | null | undefined;
}

export function FormLayout({
  selectedAsset,
  handleOpenAssetPicker,
  assetItemElementInitialOffset,
  currentAccount,
}: FormLayoutProps) {
  const { fiatCurrencyPreference } = useSettings();

  switch (selectedAsset.protocol) {
    case 'nativeBtc':
      return (
        <BtcDataLoader account={currentAccount}>
          {({ availableBalance, quoteBalance, feeRates, utxos, marketData }) => {
            return (
              <BtcForm
                quoteCurrency={fiatCurrencyPreference}
                marketData={marketData}
                availableBalance={availableBalance}
                quoteBalance={quoteBalance}
                feeRates={feeRates}
                utxos={utxos}
                assetItemAnimationOffsetTop={assetItemElementInitialOffset}
                onOpenAssetPicker={handleOpenAssetPicker}
              />
            );
          }}
        </BtcDataLoader>
      );
    case 'nativeStx':
      return (
        <StxDataLoader account={currentAccount}>
          {({ availableBalance, quoteBalance, marketData, nonce }) => {
            return (
              <StxForm
                marketData={marketData}
                availableBalance={availableBalance}
                quoteBalance={quoteBalance}
                quoteCurrency={fiatCurrencyPreference}
                nonce={nonce}
                onOpenAssetPicker={handleOpenAssetPicker}
                assetItemAnimationOffsetTop={assetItemElementInitialOffset}
              />
            );
          }}
        </StxDataLoader>
      );
    case 'sip10':
      return (
        <Sip10DataLoader account={currentAccount} asset={selectedAsset}>
          {({ balance, marketData, nonce }) => {
            return (
              <Sip10Form
                asset={selectedAsset}
                marketData={marketData}
                availableBalance={balance.crypto.availableBalance}
                quoteBalance={balance.quote.availableBalance}
                quoteCurrency={fiatCurrencyPreference}
                nonce={nonce}
                onOpenAssetPicker={handleOpenAssetPicker}
                assetItemAnimationOffsetTop={assetItemElementInitialOffset}
              />
            );
          }}
        </Sip10DataLoader>
      );
    default:
      return null;
  }
}
