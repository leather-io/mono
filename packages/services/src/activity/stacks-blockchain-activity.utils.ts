import {
  ContractCallTransaction,
  MempoolContractCallTransaction,
  MempoolSmartContractTransaction,
  MempoolTokenTransferTransaction,
  SmartContractTransaction,
  TokenTransferTransaction,
} from '@stacks/stacks-blockchain-api-types';

import { stxAsset } from '@leather.io/constants';
import {
  AccountAddresses,
  BlockchainActivity,
  BlockchainActivityEvent,
  StacksProtocolAction,
  StacksProtocolId,
} from '@leather.io/models';
import { createMoney, initBigNumber } from '@leather.io/utils';

import {
  mapStacksTxBlockHeight,
  mapStacksTxBlockTime,
  mapStacksTxFee,
  mapStacksTxStatus,
} from './stacks-tx-activity.utils';

export function mapStacksTokenTransfer(
  tx: TokenTransferTransaction | MempoolTokenTransferTransaction,
  account: AccountAddresses
): BlockchainActivity {
  const isSend = tx.sender_address === account.stacks?.stxAddress;
  const event: BlockchainActivityEvent = {
    action: isSend ? 'sent' : 'received',
    asset: stxAsset,
    counterparty: isSend ? tx.token_transfer.recipient_address : tx.sender_address,
    amount: {
      crypto: createMoney(initBigNumber(tx.token_transfer.amount), 'STX'),
      quote: createMoney(0, 'USD'),
    },
  };

  return {
    timestamp: mapStacksTxBlockTime(tx),
    txid: tx.tx_id,
    blockHeight: mapStacksTxBlockHeight(tx),
    fee: createMoney(initBigNumber(mapStacksTxFee(tx)), 'STX'),
    status: mapStacksTxStatus(tx),
    chain: 'stacks',
    initiatedByUser: tx.sender_address === account.stacks?.stxAddress,
    events: [event],
  };
}

interface ContractCallProtocolInfo {
  readonly protocol?: StacksProtocolId;
  readonly action?: StacksProtocolAction;
}

export function mapStacksContractCall(
  tx: ContractCallTransaction | MempoolContractCallTransaction,
  account: AccountAddresses,
  events: BlockchainActivityEvent[],
  protocolInfo: ContractCallProtocolInfo
): BlockchainActivity {
  return {
    timestamp: mapStacksTxBlockTime(tx),
    txid: tx.tx_id,
    blockHeight: mapStacksTxBlockHeight(tx),
    fee: createMoney(initBigNumber(mapStacksTxFee(tx)), 'STX'),
    status: mapStacksTxStatus(tx),
    chain: 'stacks',
    initiatedByUser: tx.sender_address === account.stacks?.stxAddress,
    events,
    contract: {
      type: 'call',
      contractId: tx.contract_call.contract_id,
      functionName: tx.contract_call.function_name,
      protocol: protocolInfo.protocol,
      action: protocolInfo.action,
    },
  };
}

export function mapStacksSmartContractDeploy(
  tx: SmartContractTransaction | MempoolSmartContractTransaction,
  account: AccountAddresses,
  events: BlockchainActivityEvent[]
): BlockchainActivity | undefined {
  if (tx.sender_address !== account.stacks?.stxAddress) return;

  return {
    timestamp: mapStacksTxBlockTime(tx),
    txid: tx.tx_id,
    blockHeight: mapStacksTxBlockHeight(tx),
    fee: createMoney(initBigNumber(mapStacksTxFee(tx)), 'STX'),
    status: mapStacksTxStatus(tx),
    chain: 'stacks',
    initiatedByUser: true,
    events,
    contract: {
      type: 'deploy',
      contractId: tx.smart_contract.contract_id,
    },
  };
}
