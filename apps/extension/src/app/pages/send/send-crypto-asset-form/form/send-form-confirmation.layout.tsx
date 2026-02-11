import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Stack } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';
import { inferPrincipalTypeFromAddress } from '@leather.io/stacks';
import { Button, Callout } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { StacksAddressDisplayer } from '@app/components/address-displayer/stacks-address-displayer';
import {
  InfoCardAssetValue,
  InfoCardRow,
  InfoCardSeparator,
} from '@app/components/info-card/info-card';
import { Card } from '@app/components/layout';

interface SendFormConfirmationLayoutProps {
  recipient?: string | null;
  fee?: Money;
  totalSpend: string;
  symbol: string;
  txValue: Money;
  sendingValue: string;
  txFiatValue?: string;
  txFiatValueSymbol?: string;
  nonce: string;
  memoDisplayText: string;
  isLoading: boolean;
  feeWarningTooltip?: React.ReactNode;
  onBroadcastTransaction(): void;
}
export function SendFormConfirmationLayout({
  txValue,
  txFiatValue,
  txFiatValueSymbol,
  recipient,
  fee,
  totalSpend,
  sendingValue,
  isLoading,
  onBroadcastTransaction,
  nonce,
  memoDisplayText,
  symbol,
  feeWarningTooltip,
}: SendFormConfirmationLayoutProps) {
  const principalType = recipient ? inferPrincipalTypeFromAddress(recipient) : 'invalid';

  return (
    <Card
      dataTestId={SendCryptoAssetSelectors.ConfirmationDetails}
      contentStyle={{ p: 'space.00' }}
      footer={
        <Button
          aria-busy={isLoading}
          data-testid={SendCryptoAssetSelectors.ConfirmSendTxBtn}
          onClick={onBroadcastTransaction}
          width="100%"
        >
          Confirm and send transaction
        </Button>
      }
    >
      <InfoCardAssetValue
        data-testid={SendCryptoAssetSelectors.ConfirmationDetailsAssetValue}
        fiatSymbol={txFiatValueSymbol}
        fiatValue={txFiatValue}
        mb="space.05"
        mt={['unset', 'space.05']}
        px="space.05"
        symbol={symbol}
        value={txValue}
      />

      {principalType === 'standard' && (
        <Callout variant="info" title="Sending to an exchange?" px="space.03" mb="space.05">
          {`Make sure you include the memo so the exchange can credit the ${symbol} to your account`}
        </Callout>
      )}
      {principalType === 'contract' && (
        <Callout variant="warning" title="Sending to a smart contract" px="space.03" mb="space.05">
          The recipient is a Stacks contract address. Make sure you understand how it works and that fund recovery is possible.
        </Callout>
      )}

      <Stack pb="space.06" px="space.06" width="100%">
        {recipient && (
          <InfoCardRow
            title="To"
            value={<StacksAddressDisplayer address={recipient} />}
            data-testid={SendCryptoAssetSelectors.ConfirmationDetailsRecipient}
          />
        )}
        <InfoCardSeparator />
        <InfoCardRow title="Total spend" value={totalSpend} />
        <InfoCardRow title="Sending" value={sendingValue} />
        {fee && (
          <InfoCardRow
            title="Fee"
            value={formatCurrency(fee)}
            titleAdditionalElement={feeWarningTooltip}
            data-testid={SendCryptoAssetSelectors.ConfirmationDetailsFee}
          />
        )}
        <InfoCardRow
          title="Memo"
          value={memoDisplayText}
          data-testid={SendCryptoAssetSelectors.ConfirmationDetailsMemo}
        />
        <InfoCardRow title="Nonce" value={nonce} />
      </Stack>
    </Card>
  );
}
