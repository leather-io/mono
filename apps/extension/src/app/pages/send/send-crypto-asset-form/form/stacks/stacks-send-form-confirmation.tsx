import { useRef } from 'react';
import { useParams } from 'react-router';

import {
  type StacksTransactionWire,
  deserializeTransaction,
  isTokenTransferPayload,
} from '@stacks/transactions';
import { Box, Stack } from 'leather-styles/jsx';

import { BasicTooltip, Callout, InfoCircleIcon } from '@leather.io/ui';
import {
  baseCurrencyAmountInQuote,
  convertAmountToBaseUnit,
  isString,
  sumMoney,
} from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useRouteState } from '@app/common/hooks/use-route-state';
import { useSubmitTransactionCallback } from '@app/common/hooks/use-submit-stx-transaction';
import {
  getNonceFromStacksTransaction,
  getRecipientFromStacksTransaction,
  getSip10MemoDisplayText,
  getSip10TransferAmount,
  getSip10TransferPayload,
  getStacksTransactionFee,
  getTokenTransferAmount,
  getTokenTransferMemoDisplayText,
  isNonSequentialMultisigTransaction,
} from '@app/common/transactions/stacks/transaction.utils';
import { useStacksBroadcastTransaction } from '@app/common/transactions/stacks/use-stacks-broadcast-transaction';
import { StacksAddressDisplayer } from '@app/components/address-displayer/stacks-address-displayer';
import { InfoCardRow, InfoCardSeparator } from '@app/components/info-card/info-card';
import { Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { toastDurations, useToast } from '@app/features/toasts/use-toast';
import { useCryptoCurrencyMarketData } from '@app/query/common/market-data/market-data.hooks';
import { useRotationStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useSignStacksTransaction } from '@app/store/transactions/transaction.hooks';
import { LoadingKeys } from '@app/store/ui/ui.hooks';

import type { ProposalSentSummaryState } from '../../../sent-summary/proposal-sent-summary';
import { stacksConfirmationRouteStateSchema } from '../../hooks/use-send-form-navigate';
import { SendFormConfirmationLayout } from '../send-form-confirmation.layout';
import { useProposeStacksSendTransaction } from './use-propose-stacks-send-transaction';

export function StacksSendFormConfirmation() {
  const {
    tx: txHex,
    decimals,
    showFeeChangeWarning = false,
    rotationTx: rotationTxHex,
  } = useRouteState(stacksConfirmationRouteStateSchema);
  const tokenMarketData = useCryptoCurrencyMarketData('STX');

  const { symbol = 'STX' } = useParams();

  const tx = deserializeTransaction(txHex);
  const sip10Payload = getSip10TransferPayload(tx);
  const isMultisigProposal = isNonSequentialMultisigTransaction(tx);

  const rotationTx = rotationTxHex ? deserializeTransaction(rotationTxHex) : undefined;
  const rotationAddress = rotationTx ? getRecipientFromStacksTransaction(rotationTx) : null;
  const signedRotationTx = useRef<StacksTransactionWire | null | undefined>(undefined);

  const nextAccount = useRotationStacksAccount();
  const keyActions = useKeyActions();
  const toast = useToast();
  const signStacksTransaction = useSignStacksTransaction();
  const submitTransaction = useSubmitTransactionCallback({
    loadingKey: LoadingKeys.SUBMIT_STACKS_TRANSACTION,
  });

  function broadcastRotationTx() {
    if (!signedRotationTx.current) return;
    void submitTransaction({
      onSuccess() {
        if (nextAccount?.type === 'software') void keyActions.createNewAccount();
        if (nextAccount?.type === 'ledger')
          keyActions.switchAccount({
            fingerprint: nextAccount.fingerprint,
            accountIndex: nextAccount.accountIndex,
          });
        toast.success('Moved remaining STX and switched to the fresh account', {
          duration: toastDurations.standard,
        });
      },
      onError(error) {
        const message = isString(error) ? error : error.message;
        toast.error(`Your send went through, but moving remaining STX failed: ${message}`);
      },
    })(signedRotationTx.current);
  }

  const { stacksBroadcastTransaction, stacksBroadcastSignedTransaction, isBroadcasting } =
    useStacksBroadcastTransaction({
      token: symbol.toUpperCase(),
      redirectToSuccessPage: true,
      onBroadcastSuccess: rotationTx ? broadcastRotationTx : undefined,
    });
  const { proposeSendTransaction, isProposing } = useProposeStacksSendTransaction();

  const feeWarningTooltip = showFeeChangeWarning ? (
    <BasicTooltip
      label="You are using a nonce for this transaction that is already pending. The fee has been increased so that it is exactly high enough to replace the pending transaction with the same nonce."
      side="bottom"
    >
      <Stack>
        <Box>
          <InfoCircleIcon color="ink.text-subdued" variant="small" />
        </Box>
      </Stack>
    </BasicTooltip>
  ) : null;

  function getProposalSummary(): ProposalSentSummaryState | null {
    const base = {
      symbol: symbol.toUpperCase(),
      recipient: getRecipientFromStacksTransaction(tx) ?? '',
      feeRowValue: formatCurrency(getStacksTransactionFee(tx)),
    };
    if (isTokenTransferPayload(tx.payload)) {
      const amount = getTokenTransferAmount(tx.payload);
      return {
        ...base,
        txValue: convertAmountToBaseUnit(amount).toString(),
        txFiatValue: formatCurrency(baseCurrencyAmountInQuote(amount, tokenMarketData)),
        txFiatValueSymbol: tokenMarketData.price.symbol,
        memoDisplayText: getTokenTransferMemoDisplayText(tx.payload) || 'No memo',
      };
    }
    if (sip10Payload) {
      const amount = getSip10TransferAmount(sip10Payload, symbol, decimals);
      return {
        ...base,
        txValue: convertAmountToBaseUnit(amount).toString(),
        memoDisplayText: getSip10MemoDisplayText(sip10Payload) ?? 'No memo',
      };
    }
    return null;
  }

  const proposalSummary = getProposalSummary();

  async function onConfirmTransaction() {
    if (isMultisigProposal) {
      if (!proposalSummary)
        throw new Error('Unsupported payload for a multisig transaction proposal');
      return proposeSendTransaction(tx, proposalSummary);
    }
    if (rotationTx) {
      if (rotationAddress !== nextAccount?.address)
        return toast.error('Your accounts changed. Go back and review this transaction again.');
      // TODO: test ledger flow
      try {
        const signedSendTx = await signStacksTransaction(tx);
        if (!signedSendTx) return;
        signedRotationTx.current = await signStacksTransaction(rotationTx);
        if (!signedRotationTx.current) return toast.error('Unable to sign the second transaction');
        return stacksBroadcastSignedTransaction(signedSendTx);
      } catch {
        return toast.error('Signing was cancelled. Nothing was sent.');
      }
    }
    return stacksBroadcastTransaction(tx);
  }

  const sharedProps = {
    symbol: symbol.toUpperCase(),
    onBroadcastTransaction: onConfirmTransaction,
    recipient: getRecipientFromStacksTransaction(tx),
    fee: getStacksTransactionFee(tx),
    nonce: isMultisigProposal ? undefined : getNonceFromStacksTransaction(tx).toString(),
    isLoading: isBroadcasting || isProposing,
    feeWarningTooltip,
    confirmButtonLabel: isMultisigProposal ? 'Propose transaction' : undefined,
  } as const;

  const rotationContent =
    rotationTx && isTokenTransferPayload(rotationTx.payload) && rotationAddress ? (
      <>
        <InfoCardSeparator />
        <InfoCardRow
          title="Moving to fresh address"
          value={formatCurrency(getTokenTransferAmount(rotationTx.payload))}
        />
        <InfoCardRow
          title="Fresh address"
          value={<StacksAddressDisplayer address={rotationAddress} />}
        />
        <InfoCardRow
          title="Second fee"
          value={formatCurrency(getStacksTransactionFee(rotationTx))}
        />
        <Callout variant="info" title="This sends two transactions" mt="space.03">
          You approve the send first, then the move. Stacked STX, tokens, NFTs and BNS names stay at
          your current address. You switch to the new account after both are sent.
        </Callout>
      </>
    ) : null;

  return (
    <>
      <PageHeader title="Review" />
      <Content>
        <Page>
          {isTokenTransferPayload(tx.payload) && (
            <SendFormConfirmationLayout
              txValue={getTokenTransferAmount(tx.payload)}
              txFiatValue={formatCurrency(
                baseCurrencyAmountInQuote(getTokenTransferAmount(tx.payload), tokenMarketData)
              )}
              txFiatValueSymbol={tokenMarketData.price.symbol}
              totalSpend={formatCurrency(
                sumMoney([sharedProps.fee, getTokenTransferAmount(tx.payload)])
              )}
              sendingValue={formatCurrency(getTokenTransferAmount(tx.payload))}
              memoDisplayText={getTokenTransferMemoDisplayText(tx.payload) || 'No memo'}
              additionalContent={rotationContent}
              {...sharedProps}
            />
          )}
          {sip10Payload && (
            <SendFormConfirmationLayout
              txValue={getSip10TransferAmount(sip10Payload, symbol, decimals)}
              totalSpend={[
                formatCurrency(getSip10TransferAmount(sip10Payload, symbol, decimals)),
                formatCurrency(sharedProps.fee),
              ].join(' + ')}
              sendingValue={formatCurrency(getSip10TransferAmount(sip10Payload, symbol, decimals))}
              memoDisplayText={getSip10MemoDisplayText(sip10Payload) ?? 'No memo'}
              {...sharedProps}
            />
          )}
        </Page>
      </Content>
    </>
  );
}
