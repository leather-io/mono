import { Account } from '@/store/accounts/accounts';

export interface InternalRecipientSuggestionEntry {
  type: 'internal';
  id: string;
  address: string;
  rawAccount: Account;
}

export interface ExternalRecipientSuggestionEntry {
  type: 'external';
  id: string;
  address: string;
  bnsName?: string;
}

export type RecipientSuggestionEntry =
  | InternalRecipientSuggestionEntry
  | ExternalRecipientSuggestionEntry;

export type RecipientSuggestions =
  | { matching: RecipientSuggestionEntry[] }
  | { accounts: InternalRecipientSuggestionEntry[]; recents: RecipientSuggestionEntry[] };

export interface RecipientSection {
  title: string;
  data: RecipientSuggestionEntry[];
}
