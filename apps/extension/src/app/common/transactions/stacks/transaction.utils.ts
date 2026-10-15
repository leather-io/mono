import type { StacksNetwork } from '@stacks/network';
import {
  AddressHashMode,
  ClarityType,
  type ContractCallPayload,
  type StacksTransactionWire,
  type TokenTransferPayloadWire,
  addressFromVersionHash,
  addressHashModeToVersion,
  addressToString,
  createAddress,
  cvToString,
  deserializeMemoString,
  isTokenTransferPayload,
  serializeCV,
} from '@stacks/transactions';
import { BigNumber } from 'bignumber.js';

import {
  type StacksTransaction,
  type StacksTxStatus,
  isStacksMempoolTransaction,
} from '@leather.io/models';
import { getStacksContractName } from '@leather.io/stacks';
import {
  createMoney,
  isDefined,
  removeTrailingNullCharacters,
  truncateMiddle,
} from '@leather.io/utils';

import { safeCall } from '@shared/utils';

import { stacksValue } from '@app/common/stacks-utils';
import { getStacksNetworkFromChainId } from '@app/store/networks/networks.hooks';

export function statusFromTx(tx: StacksTransaction): StacksTxStatus {
  const { status } = tx;
  if (status === 'pending') return 'pending';
  if (status === 'success') return 'success';
  return 'failed';
}

export function stacksTransactionToHex(transaction: StacksTransactionWire) {
  return `0x${transaction.serialize()}`;
}

export function getTxCaption(transaction: StacksTransaction) {
  switch (transaction.type) {
    case 'smart_contract':
      return truncateMiddle(transaction.smart_contract.contract_id.split('.')[0], 4);
    case 'contract_call':
      return transaction.contract_call.contract_id.split('.')[1];
    case 'token_transfer':
    case 'coinbase':
    case 'poison_microblock':
      return truncateMiddle(transaction.tx_id, 4);
    default:
      return null;
  }
}

export function getTxValue(tx: StacksTransaction, isOriginator: boolean): string | null {
  if (tx.type === 'token_transfer') {
    return `${isOriginator ? '-' : ''}${stacksValue({
      value: tx.token_transfer.amount,
      withTicker: false,
    })}`;
  }
  return null;
}

export function getTxTitle(tx: StacksTransaction) {
  switch (tx.type) {
    case 'token_transfer':
      return 'Stacks';
    case 'contract_call':
      return tx.contract_call.function_name;
    case 'smart_contract':
      return getStacksContractName(tx.smart_contract.contract_id);
    case 'coinbase':
      return isStacksMempoolTransaction(tx) ? 'Coinbase' : `Coinbase ${tx.block.height}`;
    case 'poison_microblock':
      return 'Poison Microblock';
    case 'tenure_change':
      return 'Tenure Change';
    default:
      return 'Transaction';
  }
}

function getAddressFromPublicKeyHash(
  publicKeyHash: Buffer,
  hashMode: AddressHashMode,
  network: StacksNetwork
): string {
  const addrVer = addressHashModeToVersion(hashMode, network);
  if (publicKeyHash.length !== 20) {
    throw new Error('expected 20-byte pubkeyhash');
  }
  const addr = addressFromVersionHash(addrVer, publicKeyHash.toString('hex'));
  return addressToString(addr);
}

export function getTxSenderAddress(tx: StacksTransactionWire): string | undefined {
  if (!tx?.auth?.spendingCondition?.signer) return;
  const txSender = getAddressFromPublicKeyHash(
    Buffer.from(tx.auth.spendingCondition.signer, 'hex'),
    tx.auth.spendingCondition.hashMode,
    getStacksNetworkFromChainId(tx.chainId)
  );
  return txSender;
}

export function isNonSequentialMultisigTransaction(tx: StacksTransactionWire) {
  const hashMode = tx.auth.spendingCondition.hashMode;
  return (
    hashMode === AddressHashMode.P2SHNonSequential ||
    hashMode === AddressHashMode.P2WSHNonSequential
  );
}

export function isPendingTx(tx: StacksTransaction) {
  return tx.status === 'pending';
}

export const StacksTransactionActionType = {
  Cancel: 'cancel',
  IncreaseFee: 'increase-fee',
} as const;
export type StacksTransactionActionType =
  (typeof StacksTransactionActionType)[keyof typeof StacksTransactionActionType];

export function getRecipientFromStacksTransaction(transaction: StacksTransactionWire) {
  if (isTokenTransferPayload(transaction.payload)) {
    return cvToString(transaction.payload.recipient);
  }

  const sip10Payload = getSip10TransferPayload(transaction);
  if (sip10Payload) {
    const sip10RecipientArg = sip10Payload.functionArgs?.[2];
    if (!sip10RecipientArg) return null;
    const [result] = safeCall(() => cvToString(sip10RecipientArg));
    return result;
  }

  return null;
}

export function getTokenTransferAmount(payload: TokenTransferPayloadWire) {
  return createMoney(Number(payload.amount), 'STX');
}

export function getTokenTransferMemoDisplayText(payload: TokenTransferPayloadWire) {
  return removeTrailingNullCharacters(payload.memo.content);
}

export function getStacksTransactionFee(tx: StacksTransactionWire) {
  return createMoney(Number(tx.auth.spendingCondition.fee), 'STX');
}

export function getNonceFromStacksTransaction(tx: StacksTransactionWire) {
  return Number(tx.auth.spendingCondition.nonce);
}

export function getSip10TransferAmount(
  payload: ContractCallPayload,
  symbol: string,
  decimals?: number
) {
  const amountArg = payload.functionArgs?.[0];
  const amount = new BigNumber(
    Number(amountArg && 'value' in amountArg ? amountArg.value : undefined)
  );
  return createMoney(amount, symbol.toUpperCase(), decimals);
}

export function getSip10TransferPayload(tx: StacksTransactionWire) {
  const { payload } = tx;
  if (!payload || !('functionName' in payload)) return undefined;
  if (payload.functionName.content !== 'transfer') return undefined;
  if (payload.functionArgs.length !== 3 && payload.functionArgs.length !== 4) return undefined;
  return payload;
}

export function getSip10MemoDisplayText(payload: ContractCallPayload) {
  if (!isDefined(payload.functionArgs[3])) return null;
  const isSome = payload.functionArgs[3].type === ClarityType.OptionalSome;
  return isSome ? deserializeMemoString(serializeCV(payload.functionArgs[3])).content : null;
}

export function getContractAddressFromContractCallPayload(payload: ContractCallPayload) {
  const contractAddress = addressToString(payload.contractAddress);
  const contractName = payload.contractName.content;
  return [contractAddress, contractName].join('.');
}

export function safeAddressToString(address: string) {
  try {
    return addressToString(createAddress(address));
  } catch {
    return null;
  }
}
