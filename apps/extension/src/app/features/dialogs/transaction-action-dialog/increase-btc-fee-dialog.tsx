import { Suspense } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';

import { Formik } from 'formik';
import { Flex, Stack } from 'leather-styles/jsx';

import type { BitcoinTx } from '@leather.io/models';
import { Caption, Sheet, SheetHeader, Spinner } from '@leather.io/ui';
import { btcToSat, createMoney, sumMoney } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { getBitcoinTxValue } from '@app/common/transactions/bitcoin/utils';
import { BitcoinCustomFeeInput } from '@app/components/bitcoin-custom-fee/bitcoin-custom-fee-input';
import { BitcoinTransactionItem } from '@app/components/bitcoin-transaction-item/bitcoin-transaction-item';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useBitcoinTransactionByTxid } from '@app/query/bitcoin/transaction/use-bitcoin-transaction-by-txid';
import { useCurrentAccountNativeSegwitIndexZeroSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { TransactionActions } from './components/transaction-actions';
import { useBtcIncreaseFee } from './hooks/use-btc-increase-fee';

interface IncreaseBtcFeeSheetInnerProps {
  btcTx: BitcoinTx;
  txid: string;
}

function IncreaseBtcFeeSheetInner({ btcTx, txid }: IncreaseBtcFeeSheetInnerProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const nativeSegwitSigner = useCurrentAccountNativeSegwitIndexZeroSigner();
  const currentBitcoinAddress = nativeSegwitSigner.address;
  const { btc: balance } = useCurrentBtcBalanceWithFallback();
  const { isBroadcasting, sizeInfo, onSubmit, validationSchema, recipient } =
    useBtcIncreaseFee(btcTx);

  const btcBalance = formatCurrency(sumMoney([balance.availableBalance, balance.outboundBalance]));

  const recipients = [
    {
      address: recipient,
      amount: createMoney(btcToSat(getBitcoinTxValue(currentBitcoinAddress, btcTx)), 'BTC'),
    },
  ];

  function onClose() {
    void navigate(RouteUrls.Home);
  }

  const initialFeeRate = btcTx.fee ? `${(btcTx.fee / sizeInfo.txVBytes).toFixed(0)}` : '1';

  return (
    <>
      <Formik
        initialValues={{ feeRate: initialFeeRate }}
        onSubmit={onSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        validateOnMount={false}
        validationSchema={validationSchema}
      >
        {({ submitForm }) => (
          <>
            <Sheet
              isShowing={location.pathname === RouteUrls.IncreaseBtcFee.replace(':txid', txid)}
              onClose={onClose}
              header={<SheetHeader title="Increase fee" />}
              footer={
                <TransactionActions
                  isDisabled={isBroadcasting}
                  isBroadcasting={isBroadcasting}
                  onSubmit={submitForm}
                  onCancel={() => navigate(RouteUrls.Home)}
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
                    If your transaction is pending for a long time, its fee might not be high enough
                    to be included in a block. Update the fee for a higher value and try again.
                  </Caption>
                  <Stack gap="space.06">
                    <BitcoinTransactionItem transaction={btcTx} />
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
            <Outlet />
          </>
        )}
      </Formik>
    </>
  );
}

export function IncreaseBtcFeeSheet() {
  const { txid } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  if (!txid) throw new Error('Transaction id should be provided');

  const { data: btcTx, isLoading } = useBitcoinTransactionByTxid(txid);

  if (isLoading) return <LoadingSpinner />;

  if (!btcTx) {
    toast.error('Transaction not found');
    void navigate(RouteUrls.Home);
    return null;
  }

  return <IncreaseBtcFeeSheetInner btcTx={btcTx} txid={txid} />;
}
