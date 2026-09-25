import { Outlet, useLocation, useNavigate } from 'react-router';

import type { StacksTransactionWire } from '@stacks/transactions';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';

import type { SbtcSponsoredTransferDetails } from '@leather.io/stacks';
import { Callout } from '@leather.io/ui';
import { baseCurrencyAmountInQuote, createMoney, sumMoney } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { getNonceFromStacksTransaction } from '@app/common/transactions/stacks/transaction.utils';
import type { SbtcSponsoredTransfer } from '@app/common/transactions/stacks/use-build-sbtc-sponsored-transfer';
import { useSubmitSbtcSponsoredTransaction } from '@app/common/transactions/stacks/use-submit-sbtc-sponsored-transaction';
import { SponsoredFeeBadge } from '@app/components/fees-row/components/sponsored-fee-badge';
import { Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useMarketDataByAssetId } from '@app/query/common/market-data/market-data.query';

import type { SbtcSponsorshipRouteState } from '../../hooks/use-send-form-navigate';
import { SendFormConfirmationLayout } from '../send-form-confirmation.layout';

interface SbtcSponsoredSendFormConfirmationProps {
  tx: StacksTransactionWire;
  details: SbtcSponsoredTransferDetails;
  sponsorship: SbtcSponsorshipRouteState;
  symbol: string;
  showRequoteCallout: boolean;
}
export function SbtcSponsoredSendFormConfirmation({
  tx,
  details,
  sponsorship,
  symbol,
  showRequoteCallout,
}: SbtcSponsoredSendFormConfirmationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const marketData = useMarketDataByAssetId({ protocol: 'sip10', id: details.contractId });

  function onRequoted({ tx: nextTx, sponsorship: nextSponsorship }: SbtcSponsoredTransfer) {
    void navigate(location.pathname, {
      replace: true,
      state: {
        decimals: nextSponsorship.decimals,
        tx: nextTx.serialize(),
        sponsorship: nextSponsorship,
        showRequoteCallout: true,
      },
    });
  }

  const { submitSponsoredTransaction, isSubmitting } = useSubmitSbtcSponsoredTransaction({
    token: symbol,
    sponsorship,
    onRequoted,
  });

  const displaySymbol = symbol.toUpperCase();
  const amount = createMoney(details.amount, displaySymbol, sponsorship.decimals);
  const fee = createMoney(details.feeAmount, displaySymbol, sponsorship.decimals);
  const total = sumMoney([amount, fee]);

  const fiatValue =
    marketData.value && marketData.value.price.amount.isGreaterThan(0)
      ? baseCurrencyAmountInQuote(
          createMoney(details.amount, marketData.value.pair.base, sponsorship.decimals),
          marketData.value
        )
      : undefined;

  return (
    <>
      <PageHeader title="Review" />
      <Content>
        <Page>
          <Outlet />
          {showRequoteCallout && (
            <Callout
              data-testid={SendCryptoAssetSelectors.SbtcFeeRequoteCallout}
              mb="space.04"
              title="Fee quote updated"
              variant="info"
            >
              The sBTC fee was refreshed. Review the updated total and confirm again.
            </Callout>
          )}
          <SendFormConfirmationLayout
            txValue={amount}
            txFiatValue={fiatValue ? formatCurrency(fiatValue) : undefined}
            txFiatValueSymbol={fiatValue?.symbol}
            totalSpend={formatCurrency(total)}
            sendingValue={formatCurrency(amount)}
            fee={fee}
            feeWarningTooltip={<SponsoredFeeBadge />}
            recipient={details.recipient}
            nonce={getNonceFromStacksTransaction(tx).toString()}
            memoDisplayText={details.memo ?? 'No memo'}
            isLoading={isSubmitting}
            onBroadcastTransaction={() => void submitSponsoredTransaction(tx)}
            symbol={displaySymbol}
          />
        </Page>
      </Content>
    </>
  );
}
