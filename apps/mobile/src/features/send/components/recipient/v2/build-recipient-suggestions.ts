import {
  isBnsLookupCandidate,
  normalizeSearchTerm,
} from '@/features/send/components/recipient/v2/recipient.utils';
import {
  type ExternalRecipientSuggestionEntry,
  type InternalRecipientSuggestionEntry,
  RecipientSection,
  RecipientSectionId,
  type RecipientSuggestionEntry,
} from '@/features/send/components/recipient/v2/types';
import { type Account } from '@/store/accounts/accounts';
import { filter, isShallowEqual, map, pipe, prop, sortBy, take, uniqueBy } from 'remeda';

import { SendAssetActivity } from '@leather.io/models';

export interface BuildRecipientSuggestionsParams {
  searchTerm: string;
  accounts: Account[];
  selectedAccount: Account;
  canSelfSend: boolean;
  activity: SendAssetActivity[];
  findAccountByAddress: (address: string) => Account | null;
  getAddressByAccount: (fingerprint: string, accountIndex: number) => string | null;
  performBnsLookup: (name: string) => Promise<string | null>;
  validateAddress: (value: string) => Promise<boolean>;
}

export async function buildRecipientSuggestions({
  searchTerm,
  accounts,
  selectedAccount,
  activity,
  canSelfSend,
  findAccountByAddress,
  getAddressByAccount,
  performBnsLookup,
  validateAddress,
}: BuildRecipientSuggestionsParams): Promise<RecipientSection[]> {
  const normalizedSearchTerm = normalizeSearchTerm(searchTerm);
  const recentEntries = getRecents({ activity, findAccountByAddress });
  const accountEntries = getAccounts({
    accounts,
    selectedAccount,
    canSelfSend,
    getAddressByAccount,
  });

  function getSearchResults() {
    return performSearch({
      searchTerm: normalizedSearchTerm,
      staticEntries: [...recentEntries, ...accountEntries],
      performBnsLookup,
      validateAddress,
    });
  }

  const sections =
    normalizedSearchTerm.length > 0
      ? [createSection('matching', await getSearchResults())]
      : [createSection('recents', recentEntries), createSection('accounts', accountEntries)];
  return sections.filter(section => section.data.length > 0);
}

interface PerformSearchParams {
  searchTerm: string;
  staticEntries: RecipientSuggestionEntry[];
  performBnsLookup: (name: string) => Promise<string | null>;
  validateAddress: (value: string) => Promise<boolean>;
}

async function performSearch({
  searchTerm,
  staticEntries,
  performBnsLookup,
  validateAddress,
}: PerformSearchParams): Promise<RecipientSuggestionEntry[]> {
  if (searchTerm.length === 0) {
    return [];
  }

  if (await validateAddress(searchTerm)) {
    const existingEntry = staticEntries.find(isEntryWithSameAddress(searchTerm));
    return existingEntry ? [existingEntry] : [createExternalEntry(searchTerm)];
  }

  const matches = staticEntries.filter(isLooseNameOrAddressMatch(searchTerm));
  if (matches.length > 0) {
    return matches;
  }

  if (isBnsLookupCandidate(searchTerm)) {
    const resolvedAddress = await performBnsLookup(searchTerm);
    return resolvedAddress ? [createExternalEntry(resolvedAddress, searchTerm)] : [];
  }

  return [];
}

interface GetRecentsParams {
  activity: SendAssetActivity[];
  findAccountByAddress: (address: string) => Account | null;
}

export function getRecents({
  activity,
  findAccountByAddress,
}: GetRecentsParams): RecipientSuggestionEntry[] {
  const recentItemLimit = 4;

  return pipe(
    activity,
    // Filter out contract targets
    filter(activity => activity.receivers.some(r => !r.includes('.'))),
    // Deliberately filter out own accounts from Recents. Unclear how to handle taproot addresses matching existing accounts.
    filter(activity => findAccountByAddress(activity.receivers[0] ?? '') === null),
    uniqueBy(activity => activity.receivers[0]),
    sortBy([prop('timestamp'), 'desc']),
    take(recentItemLimit),
    map(activity => ({
      type: 'external' as const,
      id: activity.txid,
      address: activity.receivers[0] ?? '',
      timestamp: activity.timestamp,
    }))
  );
}

interface GetAccountsParams {
  accounts: Account[];
  selectedAccount: Account;
  getAddressByAccount: (fingerprint: string, accountIndex: number) => string | null;
  canSelfSend: boolean;
}

export function getAccounts({
  accounts,
  selectedAccount,
  getAddressByAccount,
  canSelfSend,
}: GetAccountsParams): InternalRecipientSuggestionEntry[] {
  return pipe(
    accounts,
    filter(account => canSelfSend || !isShallowEqual(account, selectedAccount)),
    map(account => ({
      type: 'internal' as const,
      id: account.id,
      rawAccount: account,
      address: getAddressByAccount(account.fingerprint, account.accountIndex) ?? '',
    }))
  );
}

function createSection(id: RecipientSectionId, entries: RecipientSuggestionEntry[]) {
  return { id, data: entries };
}

function createExternalEntry(address: string, bnsName?: string): ExternalRecipientSuggestionEntry {
  return {
    type: 'external',
    address,
    id: address,
    bnsName,
  };
}

function isEntryWithSameAddress(address: string) {
  return function (entry: RecipientSuggestionEntry) {
    return entry.address === address;
  };
}

function isLooseNameOrAddressMatch(searchTerm: string) {
  return function (entry: RecipientSuggestionEntry) {
    const fields =
      entry.type === 'internal' ? [entry.rawAccount.name, entry.address] : [entry.address];
    return fields.some(field => field.toLowerCase().startsWith(searchTerm.toLowerCase()));
  };
}
