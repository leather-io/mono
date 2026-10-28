import { isPlainObject } from 'remeda';

import { type Sip9Attribute, type Sip9Collection } from '@leather.io/models';

import {
  type HiroAddressStxBalanceResponse,
  type HiroAddressTransactionWithTransfers,
  type HiroMetadata,
} from './hiro-stacks-api.types';

export function readStxTotalBalance(stxBalance: HiroAddressStxBalanceResponse) {
  const totalBalance = Number(stxBalance.balance);
  return isNaN(totalBalance) ? 0 : totalBalance;
}

export function readStxLockedBalance(stxBalance: HiroAddressStxBalanceResponse) {
  const lockedBalance = Number(stxBalance.locked);
  return isNaN(lockedBalance) ? 0 : lockedBalance;
}

export function filterVerboseUnusedTransactionWithTransfersData(
  data: HiroAddressTransactionWithTransfers
) {
  if (data.tx.tx_type === 'smart_contract')
    data.tx.smart_contract = { ...data.tx.smart_contract, source_code: 'redacted' };

  if (data.tx.tx_type === 'contract_call' && data.tx.contract_call.function_args) {
    data.tx.contract_call.function_args = data.tx.contract_call.function_args.map(fnArgs => ({
      ...fnArgs,
      hex: 'redacted',
      repr: 'redacted',
    }));
    data.tx.tx_result = { ...data.tx.tx_result, hex: 'redacted', repr: 'redacted' };
  }
  return data;
}

function readString(record: Record<PropertyKey, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

// Utility functions to map metadata from Hiro to Sip9Collection
export function transformHiroSip9Collection(collection?: unknown): Sip9Collection | undefined {
  if (!collection) return undefined;
  const record = isPlainObject(collection) ? collection : {};
  const totalItems = record['total_items'];

  return {
    name: readString(record, 'collection_name') || readString(record, 'name') || '',
    collectionExplorerUrl: readString(record, 'location_url') || '',
    totalItems: typeof totalItems === 'number' ? totalItems : undefined,
  };
}

export function transformHiroSip9Attributes(
  attributes?: HiroMetadata['attributes']
): Sip9Attribute[] | undefined {
  if (!attributes) return undefined;

  return attributes.map(attr => {
    const value: unknown = attr.value;
    return {
      traitType: attr.trait_type,
      value,
    };
  });
}
