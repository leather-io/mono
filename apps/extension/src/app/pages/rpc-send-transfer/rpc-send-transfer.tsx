import { useEffect, useMemo } from 'react';

import { Box, Stack } from 'leather-styles/jsx';

import { Approver, BtcAvatarIcon, ItemLayout, SkeletonLoader } from '@leather.io/ui';
import { baseCurrencyAmountInQuote, sumMoney } from '@leather.io/utils';

import { analytics } from '@shared/utils/analytics';

import { formatCurrency } from '@app/common/currency-formatter';
import { focusTabAndWindow } from '@app/common/focus-tab';
import { useCalculateMaxBitcoinSpend } from '@app/common/hooks/balance/use-calculate-max-spend';
import { useConvertCryptoCurrencyToFiatAmount } from '@app/common/hooks/use-convert-to-fiat-amount';
import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';
import { AccountBitcoinAddress } from '@app/components/account/account-bitcoin-address';
import { FormError } from '@app/components/form-error';
import { BackgroundOverlay } from '@app/components/loading-overlay';
import { TransactionActionsTitle } from '@app/components/rpc-transaction-request/transaction-actions-title';
import { TransactionHeader } from '@app/components/rpc-transaction-request/transaction-header';
import { TransactionRecipientsLayout } from '@app/components/rpc-transaction-request/transaction-recipients.layout';
import { TransactionWrapper } from '@app/components/rpc-transaction-request/transaction-wrapper';
import { FeeEditor } from '@app/features/fee-editor/fee-editor';
import {
  type FeesErrorReason,
  useFeeEditorContext,
} from '@app/features/fee-editor/fee-editor.context';
import { SigningAccountCard } from '@app/features/rpc-stacks-transaction-request/signing-account-card/signing-account-card';
import { useBitcoinFeeRates } from '@app/query/bitcoin/fees/bitcoin-fee-rates.hooks';
import { useBreakOnNonCompliantEntity } from '@app/query/common/compliance-checker/compliance-checker.query';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { useRpcSendTransferContext } from './rpc-send-transfer.context';
import { useRpcSendTransferActions } from './use-rpc-send-transfer-actions';

const feesErrorMessages: Record<FeesErrorReason, string> = {
  'insufficient-funds':
    "This account doesn't have enough funds for this transfer. Switch account or cancel the request.",
  'fee-estimation-failed': 'Unable to estimate network fees for this request',
};

function getFeesErrorMessage(showInsufficientFunds: boolean, feesError?: FeesErrorReason) {
  if (showInsufficientFunds) return feesErrorMessages['insufficient-funds'];
  if (feesError) return feesErrorMessages[feesError];
  return null;
}

export function RpcSendTransfer() {
  const currentAccount = useCurrentAccountId();
  const policy = useCurrentPolicy();
  const {
    availableBalance,
    feesError,
    isLoadingFees,
    marketData,
    onUserActivatesFeeEditor,
    selectedFee,
  } = useFeeEditorContext();
  const { recipients, recipientAddresses, amount, origin, isLoadingBalance, tabId, utxos } =
    useRpcSendTransferContext();
  const { toggleSwitchAccount, setAccountFilter } = useSwitchAccountSheet();
  const { isLoading: isLoadingFeeRates } = useBitcoinFeeRates();
  const calcMaxSpend = useCalculateMaxBitcoinSpend();

  const convertToFiatAmount = useConvertCryptoCurrencyToFiatAmount('BTC');

  useBreakOnNonCompliantEntity(recipientAddresses);

  useEffect(() => {
    setAccountFilter('bitcoin');
  }, [setAccountFilter]);

  const isInsufficientBalance =
    !isLoadingBalance && availableBalance.amount.isLessThan(amount.amount);
  const showInsufficientFunds = feesError === 'insufficient-funds' || isInsufficientBalance;
  const errorMessage = getFeesErrorMessage(showInsufficientFunds, feesError);

  const { approverActions, isBroadcasting, isSubmitted } = useRpcSendTransferActions();
  const showOverlay = isBroadcasting || isSubmitted;

  const maxSpend = calcMaxSpend(recipients[0]?.address, utxos);

  const totalFiatValue = useMemo(() => {
    const fee = selectedFee?.txFee;
    if (!fee) return '';
    return formatCurrency(baseCurrencyAmountInQuote(sumMoney([amount, fee]), marketData));
  }, [amount, marketData, selectedFee?.txFee]);

  return (
    <TransactionWrapper showOverlay={showOverlay}>
      <Approver requester={origin} width="100%">
        <Box position="relative">
          <BackgroundOverlay show={showOverlay} />
          <TransactionHeader
            title="Send token"
            href="https://leather.io/guides/connect-dapps"
            onPressRequestedByLink={e => {
              e.preventDefault();
              analytics.track('user_clicked_requested_by_link', {
                endpoint: 'sendTransfer',
              });
              focusTabAndWindow(tabId);
            }}
          />
          <SigningAccountCard
            address={<AccountBitcoinAddress accountId={currentAccount} />}
            availableBalance={availableBalance}
            fiatBalance={convertToFiatAmount(availableBalance)}
            isLoadingBalance={isLoadingBalance}
            showPolicyAccount={policy?.chain === 'bitcoin'}
            onSelectAccount={toggleSwitchAccount}
          />
          <TransactionRecipientsLayout
            title="Bitcoin"
            caption="Bitcoin blockchain"
            avatar={<BtcAvatarIcon />}
            convertToFiatAmount={convertToFiatAmount}
            recipients={recipients}
          />
          {showInsufficientFunds && (
            <Approver.Section>
              <Stack gap="space.02">
                <ItemLayout
                  titleLeft="Requested amount"
                  captionLeft={null}
                  titleRight={formatCurrency(amount)}
                  captionRight={formatCurrency(convertToFiatAmount(amount))}
                />
                <SkeletonLoader isLoading={isLoadingFeeRates} height="40px">
                  <ItemLayout
                    titleLeft="Available to send"
                    captionLeft={null}
                    titleRight={formatCurrency(maxSpend.amount)}
                    captionRight={formatCurrency(convertToFiatAmount(maxSpend.amount))}
                  />
                </SkeletonLoader>
              </Stack>
            </Approver.Section>
          )}
          {!errorMessage && (
            <FeeEditor.Trigger
              feeType="fee-rate"
              isLoading={isLoadingFees}
              isSponsored={false}
              marketData={marketData}
              onEditFee={onUserActivatesFeeEditor}
              selectedFee={selectedFee}
            />
          )}
        </Box>
        <Approver.Actions actions={approverActions}>
          {errorMessage ? (
            <Box mb="space.02">
              <FormError text={errorMessage} />
            </Box>
          ) : (
            <TransactionActionsTitle amount={totalFiatValue} isLoading={isLoadingBalance} />
          )}
        </Approver.Actions>
      </Approver>
    </TransactionWrapper>
  );
}
