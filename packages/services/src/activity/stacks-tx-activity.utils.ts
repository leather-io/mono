import {
  type ContractCallTransaction,
  type MempoolContractCallTransaction,
  type MempoolSmartContractTransaction,
  type MempoolTokenTransferTransaction,
  type SmartContractTransaction,
  type TokenTransferTransaction,
  type TransactionEvent,
} from '@stacks/stacks-blockchain-api-types';

import { stxAsset } from '@leather.io/constants';
import {
  type AccountAddresses,
  ActivityLevels,
  type BaseOnChainActivity,
  type OnChainActivity,
  OnChainActivityStatuses,
  OnChainActivityTypes,
  type ReceiveAssetActivity,
  type SendAssetActivity,
} from '@leather.io/models';
import { initBigNumber, uniqueArray } from '@leather.io/utils';

import {
  type HiroPrincipalMempoolTransaction,
  type HiroStacksMempoolTransaction,
  type HiroStacksTransaction,
  type HiroTransactionEvent,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import {
  type StacksAssetTransferWithInfo,
  aggregateTransferReceivers,
  aggregateTransferSenders,
  sumAssetTransferAmounts,
} from './stacks-asset-transfer.utils';
import { getStacksTxByStatus } from './stacks-mempool-tx.utils';

export function getEventsByTxId(events: TransactionEvent[]) {
  return events.reduce((acc, event) => {
    if (!acc.has(event.tx_id)) {
      acc.set(event.tx_id, []);
    }
    acc.get(event.tx_id)?.push(event);
    return acc;
  }, new Map<string, HiroTransactionEvent[]>());
}

function readBlockTime(tx: HiroStacksTransaction) {
  return 'block_time' in tx && typeof tx.block_time === 'number' ? tx.block_time : undefined;
}

export function mapStacksTxBlockTime(tx: HiroStacksTransaction | HiroStacksMempoolTransaction) {
  const txByStatus = getStacksTxByStatus(tx);
  if (txByStatus.mempoolTx) {
    return txByStatus.mempoolTx.receipt_time;
  } else {
    return readBlockTime(txByStatus.confirmedTx) ?? txByStatus.confirmedTx.burn_block_time;
  }
}

export function mapStacksTxBlockHeight(
  tx: HiroStacksTransaction | HiroStacksMempoolTransaction
): number | undefined {
  return getStacksTxByStatus(tx).confirmedTx?.block_height;
}

export function mapStacksTxFee(tx: HiroStacksTransaction | HiroStacksMempoolTransaction): string {
  return tx.fee_rate;
}

export function mapStacksTxStatus(tx: HiroStacksTransaction | HiroStacksMempoolTransaction) {
  if (tx.tx_status === 'success') return OnChainActivityStatuses.success;
  if (tx.tx_status === 'pending') return OnChainActivityStatuses.pending;
  return OnChainActivityStatuses.failed;
}

export function mapTokenTransferActivity(
  tx: TokenTransferTransaction | MempoolTokenTransferTransaction,
  account: AccountAddresses
): SendAssetActivity[] | ReceiveAssetActivity[] {
  const commonProps = {
    timestamp: mapStacksTxBlockTime(tx),
    level: ActivityLevels.account,
    account: account.id,
    txid: tx.tx_id,
    status: mapStacksTxStatus(tx),
    asset: stxAsset,
    amount: initBigNumber(tx.token_transfer.amount),
  };
  return tx.sender_address === account.stacks?.stxAddress
    ? [
        {
          type: OnChainActivityTypes.sendAsset,
          receivers: [tx.token_transfer.recipient_address],
          ...commonProps,
        },
      ]
    : [
        {
          type: OnChainActivityTypes.receiveAsset,
          senders: [tx.sender_address],
          ...commonProps,
        },
      ];
}

export function mapPendingStacksTxActivity(
  tx: HiroPrincipalMempoolTransaction,
  account: AccountAddresses,
  transfers: StacksAssetTransferWithInfo[] = []
): OnChainActivity[] {
  const isSender = tx.sender.address === account.stacks?.stxAddress;
  const commonProps: Omit<BaseOnChainActivity, 'type'> = {
    timestamp: tx.receipt_time,
    level: ActivityLevels.account,
    account: account.id,
    txid: tx.tx_id,
    status: OnChainActivityStatuses.pending,
  };
  switch (tx.type) {
    case 'token_transfer': {
      const transferProps = {
        ...commonProps,
        asset: stxAsset,
        amount: initBigNumber(tx.token_transfer.amount),
      };
      return isSender
        ? [
            {
              type: OnChainActivityTypes.sendAsset,
              receivers: [tx.token_transfer.recipient],
              ...transferProps,
            },
          ]
        : [
            {
              type: OnChainActivityTypes.receiveAsset,
              senders: [tx.sender.address],
              ...transferProps,
            },
          ];
    }
    case 'smart_contract': {
      const activity = mapAssetTransfersToActivity(commonProps, account, transfers);
      if (isSender) {
        activity.push({
          type: OnChainActivityTypes.deploySmartContract,
          contractId: tx.smart_contract.contract_id,
          ...commonProps,
        });
      }
      return activity;
    }
    case 'contract_call': {
      const activity = mapAssetTransfersToActivity(commonProps, account, transfers);
      if (activity.length === 0 && isSender) {
        activity.push({
          type: OnChainActivityTypes.executeSmartContract,
          contractId: tx.contract_call.contract_id,
          functionName: tx.contract_call.function_name,
          ...commonProps,
        });
      }
      return activity;
    }
    default:
      return [];
  }
}

export function mapSmartContractActivity(
  tx: SmartContractTransaction | MempoolSmartContractTransaction,
  account: AccountAddresses,
  transfers: StacksAssetTransferWithInfo[]
): OnChainActivity[] {
  const activity = mapTxAssetTransfersToActivity(tx, account, transfers);

  if (tx.sender_address === account.stacks?.stxAddress) {
    activity.push({
      type: OnChainActivityTypes.deploySmartContract,
      timestamp: mapStacksTxBlockTime(tx),
      level: ActivityLevels.account,
      account: account.id,
      txid: tx.tx_id,
      contractId: tx.smart_contract.contract_id,
      status: mapStacksTxStatus(tx),
    });
  }
  return activity;
}

export function mapContractCallActivity(
  tx: ContractCallTransaction | MempoolContractCallTransaction,
  account: AccountAddresses,
  transfers: StacksAssetTransferWithInfo[]
): OnChainActivity[] {
  const activity = mapTxAssetTransfersToActivity(tx, account, transfers);
  if (activity.length === 0 && tx.sender_address === account.stacks?.stxAddress) {
    // No transfers (or complex transfers) and contract called by wallet
    activity.push({
      type: OnChainActivityTypes.executeSmartContract,
      contractId: tx.contract_call.contract_id,
      functionName: tx.contract_call.function_name,
      timestamp: mapStacksTxBlockTime(tx),
      level: ActivityLevels.account,
      account: account.id,
      txid: tx.tx_id,
      status: mapStacksTxStatus(tx),
    });
  }
  return activity;
}

export function mapTxAssetTransfersToActivity(
  tx: HiroStacksTransaction | HiroStacksMempoolTransaction,
  account: AccountAddresses,
  transfers: StacksAssetTransferWithInfo[]
): OnChainActivity[] {
  const commonProps = {
    timestamp: mapStacksTxBlockTime(tx),
    level: ActivityLevels.account,
    account: account.id,
    txid: tx.tx_id,
    status: mapStacksTxStatus(tx),
  };
  return mapAssetTransfersToActivity(commonProps, account, transfers);
}

function mapAssetTransfersToActivity(
  commonProps: Omit<BaseOnChainActivity, 'type'>,
  account: AccountAddresses,
  transfers: StacksAssetTransferWithInfo[]
): OnChainActivity[] {
  const activity = [];

  const sends = transfers.filter(t => t.sender === account.stacks?.stxAddress);
  const receives = transfers.filter(t => t.receiver === account.stacks?.stxAddress);
  const sendAssetIds = uniqueArray(sends.map(s => s.assetId));
  const receiveAssetIds = uniqueArray(receives.map(r => r.assetId));

  const isSimpleTransfer = sendAssetIds.length <= 1 && receiveAssetIds.length <= 1;
  if (isSimpleTransfer) {
    if (sends.length > 0 && receives.length > 0) {
      activity.push({
        type: OnChainActivityTypes.swapAssets,
        fromAsset: sends[0].asset,
        fromAmount: sumAssetTransferAmounts(sends),
        toAsset: receives[0].asset,
        toAmount: sumAssetTransferAmounts(receives),
        ...commonProps,
      });
    } else if (sends.length > 0) {
      activity.push({
        type: OnChainActivityTypes.sendAsset,
        asset: sends[0].asset,
        amount: sumAssetTransferAmounts(sends),
        receivers: aggregateTransferReceivers(sends),
        ...commonProps,
      });
    } else if (receives.length > 0) {
      activity.push({
        type: OnChainActivityTypes.receiveAsset,
        asset: receives[0].asset,
        amount: sumAssetTransferAmounts(receives),
        senders: aggregateTransferSenders(receives),
        ...commonProps,
      });
    }
  }
  return activity;
}
