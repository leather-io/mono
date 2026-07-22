import { Outlet, useLocation, useNavigate } from 'react-router';

import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { Stack } from 'leather-styles/jsx';

import type { CryptoCurrency } from '@leather.io/models';
import { Button } from '@leather.io/ui';
import { baseCurrencyAmountInQuote, createMoneyFromDecimal, satToBtc } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { formatCurrency } from '@app/common/currency-formatter';
import { FormAddressDisplayer } from '@app/components/address-displayer/form-address-displayer';
import {
  InfoCardAssetValue,
  InfoCardRow,
  InfoCardSeparator,
} from '@app/components/info-card/info-card';
import { Card, Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { getPolicyAuthNetworkId } from '@app/features/multisig/multisig-network';
import { useProposeMultisigTransaction } from '@app/features/multisig/use-propose-multisig-transaction';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { useSendFormNavigate } from '../../hooks/use-send-form-navigate';

const symbol: CryptoCurrency = 'BTC';

export function BtcProposeConfirmation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const policy = useCurrentPolicy();
  const network = useCurrentNetwork();
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const { proposeMultisigTransaction, isProposing } = useProposeMultisigTransaction();
  const nav = useSendFormNavigate();

  const { psbt, recipient, fee, feeRowValue, time, amount } = state;

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

  if (policy?.chain !== 'bitcoin') return null;

  async function initiateProposal() {
    if (policy?.chain !== 'bitcoin') return;
    try {
      const proposal = await proposeMultisigTransaction({
        network: getPolicyAuthNetworkId('bitcoin', network),
        multisigAddress: policy.address,
        rawPayload: psbt,
      });

      analytics.track('propose_multisig_transaction', { symbol: 'btc' });

      void navigate(RouteUrls.SentProposalSummary, {
        state: {
          symbol,
          txValue: String(amount),
          txFiatValue,
          txFiatValueSymbol,
          recipient,
          feeRowValue,
          proposalId: proposal.id,
        },
      });
    } catch (error) {
      void nav.toErrorPage(error);
    }
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
