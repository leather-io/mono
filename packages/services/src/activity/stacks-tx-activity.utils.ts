import {
  ContractCallTransaction,
  MempoolContractCallTransaction,
  MempoolSmartContractTransaction,
  MempoolTokenTransferTransaction,
  SmartContractTransaction,
  TokenTransferTransaction,
  TransactionEvent,
} from '@stacks/stacks-blockchain-api-types';

import { stxCryptoAsset } from '@leather.io/constants';
import {
  AccountAddresses,
  ActivityLevels,
  OnChainActivity,
  OnChainActivityStatuses,
  OnChainActivityTypes,
  ReceiveAssetActivity,
  SendAssetActivity,
} from '@leather.io/models';
import { initBigNumber, uniqueArray } from '@leather.io/utils';

import {
  HiroStacksMempoolTransaction,
  HiroStacksTransaction,
  HiroTransactionEvent,
} from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  StacksAssetTransferWithInfo,
  aggregateTransferReceivers,
  aggregateTransferSenders,
  sumAssetTransferAmounts,
} from './stacks-asset-transfer.utils';

export function getEventsByTxId(events: TransactionEvent[]) {
  return events.reduce((acc, event) => {
    if (!acc.has(event.tx_id)) {
      acc.set(event.tx_id, []);
    }
    acc.get(event.tx_id)?.push(event);
    return acc;
  }, new Map<string, HiroTransactionEvent[]>());
}

export function mapStacksTxBlockTime(tx: HiroStacksTransaction | HiroStacksMempoolTransaction) {
  if (isMempoolTx(tx)) {
    return tx.receipt_time;
  } else {
    return (tx as any).block_time ?? tx.burn_block_time;
  }
}

export function isMempoolTx(
  tx: HiroStacksTransaction | HiroStacksMempoolTransaction
): tx is HiroStacksMempoolTransaction {
  return (
    tx.tx_status !== 'success' &&
    tx.tx_status !== 'abort_by_post_condition' &&
    tx.tx_status !== 'abort_by_response'
  );
}

export function mapStacksTxStatus(tx: HiroStacksTransaction | HiroStacksMempoolTransaction) {
  return tx.tx_status === 'success'
    ? OnChainActivityStatuses.success
    : tx.tx_status === 'pending'
      ? OnChainActivityStatuses.pending
      : OnChainActivityStatuses.failed;
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
    asset: stxCryptoAsset,
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
  const activity = [];

  const commonProps = {
    timestamp: mapStacksTxBlockTime(tx),
    level: ActivityLevels.account,
    account: account.id,
    txid: tx.tx_id,
    status: mapStacksTxStatus(tx),
  };

  const sends = transfers.filter(t => t.sender === account.stacks?.stxAddress);
  const receives = transfers.filter(t => t.receiver === account.stacks?.stxAddress);
  const sendAssetIds = uniqueArray(sends.map(s => s.assetId));
  const receiveAssetIds = uniqueArray(receives.map(r => r.assetId));

  const isSimpleTransfer = sendAssetIds.length <= 1 && receiveAssetIds.length <= 1;
  if (isSimpleTransfer) {
    if (sends.length > 0 && receives.length > 0) {
      activity.push({
        type: OnChainActivityTypes.swapAssets,
        fromAsset: sends[0].assetInfo,
        fromAmount: sumAssetTransferAmounts(sends),
        toAsset: receives[0].assetInfo,
        toAmount: sumAssetTransferAmounts(receives),
        ...commonProps,
      });
    } else if (sends.length > 0) {
      activity.push({
        type: OnChainActivityTypes.sendAsset,
        asset: sends[0].assetInfo,
        amount: sumAssetTransferAmounts(sends),
        receivers: aggregateTransferReceivers(sends),
        ...commonProps,
      });
    } else if (receives.length > 0) {
      activity.push({
        type: OnChainActivityTypes.receiveAsset,
        asset: receives[0].assetInfo,
        amount: sumAssetTransferAmounts(receives),
        senders: aggregateTransferSenders(receives),
        ...commonProps,
      });
    }
  }
  return activity;
}
