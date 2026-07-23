import { Navigate, Outlet } from 'react-router';

import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { Stack } from 'leather-styles/jsx';

import type { CryptoCurrency } from '@leather.io/models';
import { Button } from '@leather.io/ui';
import {
  baseCurrencyAmountInQuote,
  createMoneyFromDecimal,
  isUndefined,
  satToBtc,
} from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { useLocationStateWithCache } from '@app/common/hooks/use-location-state';
import { FormAddressDisplayer } from '@app/components/address-displayer/form-address-displayer';
import {
  InfoCardAssetValue,
  InfoCardRow,
  InfoCardSeparator,
} from '@app/components/info-card/info-card';
import { Card, Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { useProposeBtcSendTransaction } from './use-propose-btc-send-transaction';

const symbol: CryptoCurrency = 'BTC';

export function BtcProposeConfirmation() {
  const policy = useCurrentPolicy();
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const { proposeSendTransaction, isProposing } = useProposeBtcSendTransaction();

  const psbt = useLocationStateWithCache<string>('psbt');
  const recipient = useLocationStateWithCache<string>('recipient');
  const fee = useLocationStateWithCache<number>('fee');
  const feeRowValue = useLocationStateWithCache<string>('feeRowValue');
  const time = useLocationStateWithCache<string>('time');
  const amount = useLocationStateWithCache<string>('amount');

  if (
    isUndefined(psbt) ||
    isUndefined(recipient) ||
    isUndefined(fee) ||
    isUndefined(feeRowValue) ||
    isUndefined(amount)
  )
    return <Navigate to={RouteUrls.SendCryptoAssetForm.replace(':symbol', 'btc')} replace />;

  if (policy?.chain !== 'bitcoin')
    return <Navigate to={RouteUrls.SendCryptoAssetForm.replace(':symbol', 'btc')} replace />;

  const txFiatValue = formatCurrency(
    baseCurrencyAmountInQuote(createMoneyFromDecimal(Number(amount), symbol), btcMarketData)
  );
  const txFiatValueSymbol = btcMarketData.price.symbol;

  const feeInBtc = satToBtc(fee);
  const totalSpend = formatCurrency(
    createMoneyFromDecimal(Number(amount) + Number(feeInBtc), symbol),
    { preset: 'pad-decimals' }
  );
  const sendingValue = formatCurrency(createMoneyFromDecimal(Number(amount), symbol), {
    preset: 'pad-decimals',
  });

  async function initiateProposal() {
    if (isUndefined(psbt) || isUndefined(recipient)) return;
    await proposeSendTransaction(psbt, {
      symbol,
      txValue: String(amount),
      txFiatValue,
      txFiatValueSymbol,
      recipient,
      feeRowValue,
    });
  }

  return (
    <>
      <PageHeader title="Review" />
      <Content>
        <Page>
          <Outlet />
          <Card
            contentStyle={{
              p: 'space.00',
            }}
            dataTestId={SendCryptoAssetSelectors.ConfirmationDetails}
            footer={
              <Button
                data-testid={SharedComponentsSelectors.InfoCardButton}
                aria-busy={isProposing}
                onClick={initiateProposal}
                width="100%"
              >
                Propose transaction
              </Button>
            }
          >
            <InfoCardAssetValue
              data-testid={SendCryptoAssetSelectors.ConfirmationDetailsAssetValue}
              fiatSymbol={txFiatValueSymbol}
              fiatValue={txFiatValue}
              mb="space.06"
              mt="space.05"
              px="space.05"
              symbol={symbol}
              value={String(amount)}
            />

            <Stack pb="space.06" px="space.06" width="100%">
              <InfoCardRow
                title="To"
                value={<FormAddressDisplayer address={recipient} />}
                data-testid={SendCryptoAssetSelectors.ConfirmationDetailsRecipient}
              />
              <InfoCardSeparator />
              <InfoCardRow title="Total spend" value={totalSpend} />
              <InfoCardRow title="Sending" value={sendingValue} />
              <InfoCardRow
                title="Fee"
                value={feeRowValue}
                data-testid={SendCryptoAssetSelectors.ConfirmationDetailsFee}
              />
              {time && <InfoCardRow title="Estimated confirmation time" value={time} />}
            </Stack>
          </Card>
        </Page>
      </Content>
    </>
  );
}
