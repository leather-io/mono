import { Suspense } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';

import { Flex, Stack } from 'leather-styles/jsx';

import type { BitcoinTx } from '@leather.io/models';
import { Caption, Sheet, SheetHeader, Spinner } from '@leather.io/ui';
import { sumMoney } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { useLatestCallback } from '@app/common/hooks/use-latest-callback';
import { useRouteState } from '@app/common/hooks/use-route-state';
import { BitcoinCustomFeeInput } from '@app/components/bitcoin-custom-fee/bitcoin-custom-fee-input';
import { BitcoinTransactionItem } from '@app/components/bitcoin-transaction-item/bitcoin-transaction-item';
import { useCurrentBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';

import { TransactionActions } from './components/transaction-actions';
import { type IncreaseBtcFeeFormValues, useBtcIncreaseFee } from './hooks/use-btc-increase-fee';
import { increaseBtcFeeRouteStateSchema } from './increase-btc-fee-route-state';

export function IncreaseBtcFeeSheet() {
  const tx = useRouteState(increaseBtcFeeRouteStateSchema)?.btcTx;
  if (!tx) return <IncreaseBtcFeeUnsupportedSheet />;
  return <IncreaseBtcFeeSheetContent tx={tx} />;
}

function IncreaseBtcFeeUnsupportedSheet() {
  const navigate = useNavigate();

  function onClose() {
    void navigate(RouteUrls.Home);
  }

  return (
    <Sheet isShowing onClose={onClose} header={<SheetHeader title="Increase fee" />}>
      <Stack gap="space.05" px="space.05" pb="space.05">
        <Caption>This transaction can't be sped up in Leather.</Caption>
      </Stack>
    </Sheet>
  );
}

interface IncreaseBtcFeeSheetContentProps {
  tx: BitcoinTx;
}

function IncreaseBtcFeeSheetContent({ tx }: IncreaseBtcFeeSheetContentProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const btcTx = tx;
  const { btc: balance } = useCurrentBtcBalanceWithFallback();
  const { isBroadcasting, sizeInfo, onSubmit, resolver, recipients } = useBtcIncreaseFee(btcTx);

  const btcBalance = formatCurrency(sumMoney([balance.availableBalance, balance.outboundBalance]));

  function onClose() {
    void navigate(RouteUrls.Home);
  }

  const initialFeeRate = `${(tx.fee / sizeInfo.txVBytes).toFixed(0)}`;

  const form = useForm<IncreaseBtcFeeFormValues>({
    defaultValues: { feeRate: initialFeeRate },
    resolver,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });
  const submitForm = useLatestCallback(onSubmit);

  return (
    <FormProvider {...form}>
      <Sheet
        isShowing={location.pathname === RouteUrls.IncreaseBtcFee}
        onClose={onClose}
        header={<SheetHeader title="Increase fee" />}
        footer={
          <TransactionActions
            isDisabled={isBroadcasting}
            isBroadcasting={isBroadcasting}
            onSubmit={() => void form.handleSubmit(submitForm)()}
            onCancel={() => void navigate(RouteUrls.Home)}
          />
        }
      >
        <Stack gap="space.05" px="space.05" pb="space.05">
          <Suspense
            fallback={
              <Flex alignItems="center" justifyContent="center" p="space.06">
                <Spinner />
              </Flex>
            }
          >
            <Caption>
              If your transaction is pending for a long time, its fee might not be high enough to be
              included in a block. Update the fee for a higher value and try again.
            </Caption>
            <Stack gap="space.06">
              {btcTx && <BitcoinTransactionItem transaction={btcTx} />}
              <Stack gap="space.04">
                <Stack gap="space.01">
                  <BitcoinCustomFeeInput
                    isSendingMax={false}
                    recipients={recipients}
                    hasInsufficientBalanceError={false}
                    customFeeInitialValue={initialFeeRate}
                  />
                </Stack>

                {balance && <Caption>Balance: {btcBalance}</Caption>}
              </Stack>
            </Stack>
          </Suspense>
        </Stack>
      </Sheet>
    </FormProvider>
  );
}
