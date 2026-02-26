import { PayloadType, deserializeTransaction } from '@stacks/transactions';

import { type ActivityView, getStacksExplorerLink } from '@leather.io/features';
import type { NetworkConfiguration } from '@leather.io/models';

import { safelyFormatHexTxid } from '@app/common/utils/safe-handle-txid';
import type { SubmittedTransaction } from '@app/store/submitted-transactions/submitted-transactions.slice';

interface CreateSubmittedActivityViewsArgs {
  submittedTransactions: SubmittedTransaction[];
  network: NetworkConfiguration;
}

export function createSubmittedActivityViews({
  submittedTransactions,
  network,
}: CreateSubmittedActivityViewsArgs): ActivityView[] {
  return submittedTransactions
    .map(submittedTx => {
      const tx = deserializeTransaction(submittedTx.rawTx);
      const txid = safelyFormatHexTxid(submittedTx.txid);
      const activityLink = getStacksExplorerLink({
        mode: network.chain.bitcoin.mode,
        type: 'txid',
        value: txid,
        searchParams: undefined,
        isNakamoto: false,
      });

      const baseView: Omit<ActivityView, 'title' | 'caption'> = {
        key: `submitted-${txid}`,
        txid,
        asset: undefined,
        fromAsset: undefined,
        toAsset: undefined,
        activityLink,
        balances: {},
        activityAvatar: 'fallback',
        statusIndicator: 'pending',
        statusLabel: 'Submitted',
      };

      switch (tx.payload.payloadType) {
        case PayloadType.TokenTransfer:
          return {
            ...baseView,
            title: 'STX',
            caption: 'Submitting',
          };
        case PayloadType.ContractCall:
          return {
            ...baseView,
            title: tx.payload.functionName.content,
            caption: tx.payload.contractName.content,
          };
        case PayloadType.SmartContract:
          return {
            ...baseView,
            title: 'Deploying',
            caption: tx.payload.contractName.content,
          };
        default:
          return {
            ...baseView,
            title: 'Transaction',
            caption: 'Submitting',
          };
      }
    })
    .filter(view => view !== null);
}
