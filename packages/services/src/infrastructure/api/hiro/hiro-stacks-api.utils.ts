import { isPlainObject } from 'remeda';

import { type Sip9Attribute, type Sip9Collection } from '@leather.io/models';

import { type HiroMetadata, type HiroPrincipalStxBalanceResponse } from './hiro-stacks-api.types';

export function readStxTotalBalance(stxBalance: HiroPrincipalStxBalanceResponse) {
  const totalBalance = Number(stxBalance.balance);
  return isNaN(totalBalance) ? 0 : totalBalance;
}

export function readStxLockedBalance(stxBalance: HiroPrincipalStxBalanceResponse) {
  if (!stxBalance.locked) return 0;
  const lockedBalance = Number(stxBalance.locked.amount);
  return isNaN(lockedBalance) ? 0 : lockedBalance;
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
