import { useMemo } from 'react';

import * as Sentry from '@sentry/react';
import { PayloadType, addressToString, cvToString } from '@stacks/transactions';
import { BigNumber } from 'bignumber.js';

import { microStxToStx } from '@leather.io/utils';

import { isSip10TransferContactCall } from '@app/common/transactions/stacks/transaction.utils';
import { useLedgerTxSigningContext } from '@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx.context';
import { ApproveLedgerOperationLayout } from '@app/features/ledger/generic-steps/approve-ledger-operation/approve-ledger-operation.layout';
import { useHasApprovedOperation } from '@app/features/ledger/hooks/use-has-approved-transaction';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

const sipTenTransferArguments = ['Amount', 'Sender', 'To', 'Memo'];

function formatSipTenTransferArgument(index: number) {
  return `Argument ${index} — ${sipTenTransferArguments[index]}`;
}

function formatTooltipLabel(amount: bigint) {
  const stxFromMicroStx = microStxToStx(Number(amount));
  return `The amount is displayed in microstacks (µSTX) and is equal to ${stxFromMicroStx} STX`;
}

export function ApproveSignLedgerStacksTx() {
  const { transaction, chain } = useLedgerTxSigningContext();
  const currentAccount = useCurrentStacksAccount();
  const hasApprovedOperation = useHasApprovedOperation();

  const transactionDetails: [string, string, string?][] = useMemo(() => {
    if (!transaction || chain !== 'stacks') return [];

    try {
      const details: [string, string, string?][] = [];

      details.push(['Origin', currentAccount?.address ?? '']);
      details.push(['Nonce', String(transaction.auth.spendingCondition.nonce)]);

      details.push([
        'Fee (µSTX)',
        String(transaction.auth.spendingCondition.fee),
        formatTooltipLabel(transaction.auth.spendingCondition.fee),
      ]);

      if (transaction.payload.payloadType === PayloadType.TokenTransfer) {
        details.push(
          [
            'Amount (µSTX)',
            new BigNumber(String(transaction.payload.amount)).toFormat(),
            formatTooltipLabel(transaction.payload.amount),
          ],
          ['To', cvToString(transaction.payload.recipient)],
          ['Memo', transaction.payload.memo.content]
        );
        return details;
      }

      if (transaction.payload.payloadType === PayloadType.ContractCall) {
        details.push(['Contract address', addressToString(transaction.payload.contractAddress)]);
        details.push(['Contract name', transaction.payload.contractName.content]);
      }

      if (
        transaction.payload.payloadType === PayloadType.SmartContract ||
        transaction.payload.payloadType === PayloadType.VersionedSmartContract
      ) {
        details.push(['Contract address', currentAccount?.address ?? '']);
        details.push(['Contract name', transaction.payload.contractName.content]);
      }

      if (transaction.payload.payloadType === PayloadType.ContractCall) {
        details.push(['Function name', transaction.payload.functionName.content]);

        if (transaction.payload.functionArgs.length === 0) {
          details.push(['Arguments', 'None']);
        }

        if (isSip10TransferContactCall(transaction)) {
          transaction.payload.functionArgs.forEach((cv, index) => {
            details.push([formatSipTenTransferArgument(index), cvToString(cv)]);
          });
        } else {
          transaction.payload.functionArgs.forEach((cv, index) =>
            details.push([`Argument ${index + 0}`, cvToString(cv)])
          );
        }
      }

      if (
        transaction.payload.payloadType === PayloadType.SmartContract ||
        transaction.payload.payloadType === PayloadType.VersionedSmartContract
      ) {
        details.push(['Contract code', transaction.payload.codeBody.content]);
      }

      return details;
    } catch (error) {
      Sentry.captureException(error);
      return [
        ['Status', 'Error parsing arguments'],
        ['Warning', 'Please verify transaction details on your Ledger device'],
      ];
    }
  }, [chain, currentAccount?.address, transaction]);

  return (
    <ApproveLedgerOperationLayout
      description="Verify the transaction details on your Ledger"
      details={transactionDetails}
      status={hasApprovedOperation ? 'approved' : 'awaiting-approval'}
    />
  );
}
