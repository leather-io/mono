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
export function mapHiroCollection(collection?: any): Sip9Collection | undefined {
  if (!collection) return undefined;

  return {
    id: collection.collection_id || collection.id || '',
    name: collection.collection_name || collection.name || '',
    isVerified: collection.is_verified || false,
    locationUrl: collection.location_url || '',
    totalItems: collection.total_items,
    floorPrice: collection.floor_price_amount
      ? {
          amount: collection.floor_price_amount.amount,
          unit: collection.floor_price_amount.unit,
        }
      : undefined,
  };
}

export function mapHiroAttributes(
  attributes?: HiroMetadata['attributes']
): Sip9Attribute[] | undefined {
  if (!attributes) return undefined;

  return attributes.map(attr => ({
    traitType: attr.trait_type,
    displayType: attr.display_type,
    value: attr.value,
  }));
}
