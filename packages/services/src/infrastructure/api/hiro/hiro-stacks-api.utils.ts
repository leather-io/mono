import { Sip9Attribute, Sip9Collection } from '@leather.io/models';

import {
  HiroAddressStxBalanceResponse,
  HiroAddressTransactionWithTransfers,
  HiroMetadata,
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

// Utility functions to map metadata from Hiro to Sip9Collection
export function transformHiroSip9Collection(collection?: any): Sip9Collection | undefined {
  if (!collection) return undefined;

  return {
    name: collection.collection_name || collection.name || '',
    collectionExplorerUrl: collection.location_url || '',
    totalItems: collection.total_items,
  };
}

export function transformHiroSip9Attributes(
  attributes?: HiroMetadata['attributes']
): Sip9Attribute[] | undefined {
  if (!attributes) return undefined;

  return attributes.map(attr => ({
    attributeTraitType: attr.trait_type,
    attributeValue: attr.value,
  }));
}
