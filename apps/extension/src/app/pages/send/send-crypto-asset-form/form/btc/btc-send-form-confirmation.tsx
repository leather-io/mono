import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { Stack } from 'leather-styles/jsx';

import { decodeBitcoinTx } from '@leather.io/bitcoin';
import type { CryptoCurrency } from '@leather.io/models';
import { Button } from '@leather.io/ui';
import {
  baseCurrencyAmountInQuote,
  createMoney,
  createMoneyFromDecimal,
  satToBtc,
} from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { formatCurrency } from '@app/common/currency-formatter';
import { queryClient } from '@app/common/persistence';
import { FormAddressDisplayer } from '@app/components/address-displayer/form-address-displayer';
import {
  InfoCardAssetValue,
  InfoCardRow,
  InfoCardSeparator,
} from '@app/components/info-card/info-card';
import { Card, Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useInscribedSpendableUtxos } from '@app/features/discarded-inscriptions/use-inscribed-spendable-utxos';
import { useBitcoinBroadcastTransaction } from '@app/query/bitcoin/transaction/use-bitcoin-broadcast-transaction';
import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';
import { useNavigate } from '@app/routes/compat';
import { type RootState, useAppDispatch } from '@app/store';
import { sendNavigationSlice } from '@app/store/navigation/send-navigation.slice';

import { useSendFormNavigate } from '../../hooks/use-send-form-navigate';

const symbol: CryptoCurrency = 'BTC';

function useBtcSendFormConfirmationState() {
  const confirmation = useSelector((state: RootState) => state.navigation.send.btcConfirmation);
  return {
    tx: confirmation?.tx ?? '',
    fee: confirmation?.fee ?? 0,
    feeRowValue: confirmation?.feeRowValue ?? '',
    arrivesIn: confirmation?.time ?? '',
    recipient: confirmation?.recipient ?? '',
  };
}

export function BtcSendFormConfirmation() {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tx, recipient, fee, arrivesIn, feeRowValue } = useBtcSendFormConfirmationState();

  const transaction = useMemo(() => btc.Transaction.fromRaw(hexToBytes(tx)), [tx]);

  const { refetchUtxos } = useCurrentNativeSegwitUtxos();

  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const { broadcastTx } = useBitcoinBroadcastTransaction();

  const decodedTx = decodeBitcoinTx(transaction.hex);

  const nav = useSendFormNavigate();

  const transferAmount = satToBtc(decodedTx.outputs[0].amount.toString()).toString();
  const txFiatValue = formatCurrency(
    baseCurrencyAmountInQuote(createMoneyFromDecimal(Number(transferAmount), symbol), btcMarketData)
  );
  const txFiatValueSymbol = btcMarketData.price.symbol;

  const feeInBtc = satToBtc(fee);
  const totalSpend = formatCurrency(
    createMoneyFromDecimal(Number(transferAmount) + Number(feeInBtc), symbol),
    { preset: 'pad-decimals' }
  );
  const sendingValue = formatCurrency(createMoneyFromDecimal(Number(transferAmount), symbol), {
    preset: 'pad-decimals',
  });
  const summaryFee = formatCurrency(createMoney(Number(fee), symbol), { preset: 'pad-decimals' });

  const utxosOfSpendableInscriptions = useInscribedSpendableUtxos();

  async function initiateTransaction() {
    setIsBroadcasting(true);
    await broadcastTx({
      skipSpendableCheckUtxoIds: utxosOfSpendableInscriptions.map(utxo => utxo.txid),
      tx: transaction.hex,
      async onSuccess(txid) {
        analytics.track('broadcast_transaction', {
          symbol: 'btc',
          amount: Number(transferAmount),
          fee,
          inputs: decodedTx.inputs.length,
          outputs: decodedTx.inputs.length,
        });
        await refetchUtxos();
        dispatch(sendNavigationSlice.actions.setBtcSentSummaryState(formBtcTxSummaryState(txid)));
        void navigate(RouteUrls.SentBtcTxSummary.replace(':txId', `${txid}`));

        // invalidate txs query after some time to ensure that the new tx will be shown in the list
        setTimeout(
          () => void queryClient.invalidateQueries({ queryKey: ['btc-txs-by-address'] }),
          2000
        );
      },
      onError(e) {
        analytics.track('broadcast_btc_error', {
          error: e,
        });
        void nav.toErrorPage(e);
      },
    });
    setIsBroadcasting(false);
  }

  function formBtcTxSummaryState(txId: string) {
    return {
      txLink: {
        blockchain: 'bitcoin',
        txid: txId || '',
      },
      txId,
      recipient,
      fee: summaryFee,
      txValue: transferAmount,
      arrivesIn,
      totalSpend,
      symbol,
      sendingValue,
      txFiatValue,
      txFiatValueSymbol,
      feeRowValue,
    };
  }

  return (
    <>
      <PageHeader title="Review" />
      <Content>
        <Page>
          <Card
            contentStyle={{
              p: 'space.00',
            }}
            dataTestId={SendCryptoAssetSelectors.ConfirmationDetails}
            footer={
              <Button
                data-testid={SharedComponentsSelectors.InfoCardButton}
                aria-busy={isBroadcasting}
                onClick={initiateTransaction}
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
              mb="space.06"
              mt="space.05"
              px="space.05"
              symbol={symbol}
              value={transferAmount}
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
              {arrivesIn && <InfoCardRow title="Estimated confirmation time" value={arrivesIn} />}
            </Stack>
          </Card>
        </Page>
      </Content>
    </>
  );
}
