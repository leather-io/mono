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
  timestamp?: number;
}

export type RecipientSuggestionEntry =
  | InternalRecipientSuggestionEntry
  | ExternalRecipientSuggestionEntry;

export type RecipientSectionId = 'matching' | 'recents' | 'accounts';

export interface RecipientSection {
  id: RecipientSectionId;
  data: RecipientSuggestionEntry[];
}
