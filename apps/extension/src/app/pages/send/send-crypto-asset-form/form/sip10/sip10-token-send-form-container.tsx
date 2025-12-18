import type { CryptoAssetBalance, MarketData, Sip10Asset } from '@leather.io/models';
import { AssetAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import { AmountField } from '../../components/amount-field';
import { SelectedAssetField } from '../../components/selected-asset-field';
import { SendFiatValue } from '../../components/send-fiat-value';
import { SendMaxButton } from '../../components/send-max-button';
import { StacksCommonSendForm } from '../stacks/stacks-common-send-form';
import { useSip10SendForm } from './use-sip10-send-form';

interface Sip10TokenSendFormContainerProps {
  asset: Sip10Asset;
  balance: CryptoAssetBalance;
  marketData?: MarketData;
}
export function Sip10TokenSendFormContainer({
  asset,
  balance,
  marketData,
}: Sip10TokenSendFormContainerProps) {
  const {
    availableTokenBalance,
    initialValues,
    previewTransaction,
    sendMaxBalance,
    stacksFtFees: fees,
    validationSchema,
    avatar,
    decimals,
    symbol,
  } = useSip10SendForm({ info: asset, balance });

  const amountField = (
    <AmountField
      balance={availableTokenBalance}
      bottomInputOverlay={
        <SendMaxButton balance={availableTokenBalance} sendMaxBalance={sendMaxBalance.toString()} />
      }
      tokenSymbol={symbol}
      autoComplete="off"
      switchableAmount={
        marketData ? (
          <SendFiatValue marketData={marketData} assetSymbol={symbol} assetDecimals={decimals} />
        ) : undefined
      }
    />
  );
  const selectedAssetField = (
    <SelectedAssetField
      icon={
        avatar ? (
          <AssetAvatarIcon
            asset={{
              protocol: 'sip10',
              contractId: avatar.avatar,
              imageCanonicalUri: avatar.imageCanonicalUri ?? '',
              name: asset.name,
            }}
            size="xl"
          />
        ) : (
          <StxAvatarIcon size="xl" />
        )
      }
      name={symbol}
      symbol={symbol}
    />
  );

  return (
    <StacksCommonSendForm
      onSubmit={previewTransaction}
      initialValues={initialValues}
      validationSchema={validationSchema}
      amountField={amountField}
      selectedAssetField={selectedAssetField}
      fees={fees}
      availableTokenBalance={availableTokenBalance}
    />
  );
}
