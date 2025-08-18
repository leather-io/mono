import { BtcForm } from '@/features/send/forms/btc/btc-form';
import { BtcDataLoader } from '@/features/send/forms/btc/btc-loader';
import { StxForm } from '@/features/send/forms/stx/stx-form';
import { StxDataLoader } from '@/features/send/forms/stx/stx-loader';
import { Account } from '@/store/accounts/accounts';
import { useSettings } from '@/store/settings/settings';

import { FungibleCryptoAsset } from '@leather.io/models';

import { Sip10Form } from '../forms/stx/sip10-form';
import { Sip10DataLoader } from '../forms/stx/sip10-loader';

interface FormLayoutProps {
  selectedAsset: FungibleCryptoAsset;
  selectedAccount: Account;
  handleOpenAssetPicker(): void;
  assetItemElementInitialOffset: number | null | undefined;
}

export function FormLayout({
  selectedAsset,
  selectedAccount,
  handleOpenAssetPicker,
  assetItemElementInitialOffset,
}: FormLayoutProps) {
  const { fiatCurrencyPreference } = useSettings();

  switch (selectedAsset.protocol) {
    case 'nativeBtc':
      return (
        <BtcDataLoader account={selectedAccount}>
          {({ availableBalance, quoteBalance, feeRates, utxos, marketData }) => {
            return (
              <BtcForm
                quoteCurrency={fiatCurrencyPreference}
                marketData={marketData}
                availableBalance={availableBalance}
                quoteBalance={quoteBalance}
                feeRates={feeRates}
                utxos={utxos}
                account={selectedAccount}
                assetItemAnimationOffsetTop={assetItemElementInitialOffset}
                onOpenAssetPicker={handleOpenAssetPicker}
              />
            );
          }}
        </BtcDataLoader>
      );
    case 'nativeStx':
      return (
        <StxDataLoader account={selectedAccount}>
          {({ availableBalance, quoteBalance, marketData, nonce }) => {
            return (
              <StxForm
                account={selectedAccount}
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
        <Sip10DataLoader account={selectedAccount} asset={selectedAsset}>
          {({ balance, marketData, nonce }) => {
            return (
              <Sip10Form
                account={selectedAccount}
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
