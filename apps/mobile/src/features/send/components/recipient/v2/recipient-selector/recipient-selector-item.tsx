import { AccountListItem } from '@/features/accounts/account-list/account-list-item';
import { AccountAddress } from '@/features/accounts/components/account-address';
import { AccountAvatar } from '@/features/accounts/components/account-avatar';
import { AccountBalance } from '@/features/accounts/components/account-balance';
import {
  ExternalRecipientSuggestionEntry,
  InternalRecipientSuggestionEntry,
  RecipientSuggestionEntry,
} from '@/features/send/components/recipient/v2/types';
import { useWalletByFingerprint } from '@/store/wallets/wallets.read';

import { Cell, PersonIcon } from '@leather.io/ui/native';
import { assertUnreachable, truncateMiddle } from '@leather.io/utils';

interface RecipientSelectorItemProps {
  entry: RecipientSuggestionEntry;
  onSelect(address: string): void;
}

export function RecipientSelectorItem({ entry, onSelect }: RecipientSelectorItemProps) {
  switch (entry.type) {
    case 'internal':
      return <InternalRecipientItem entry={entry} onSelect={onSelect} />;
    case 'external':
      return <ExternalRecipientItem entry={entry} onSelect={onSelect} />;
    default:
      return assertUnreachable(entry);
  }
}

interface InternalRecipientItemProps extends RecipientSelectorItemProps {
  entry: InternalRecipientSuggestionEntry;
}

function InternalRecipientItem({ entry, onSelect }: InternalRecipientItemProps) {
  const wallet = useWalletByFingerprint(entry.rawAccount.fingerprint);

  return (
    <AccountListItem
      onPress={() => onSelect(entry.address)}
      accountName={entry.rawAccount.name}
      walletName={wallet?.name}
      address={
        <AccountAddress
          accountIndex={entry.rawAccount.accountIndex}
          fingerprint={entry.rawAccount.fingerprint}
        />
      }
      icon={<AccountAvatar icon={entry.rawAccount.icon} />}
      balance={
        <AccountBalance
          accountIndex={entry.rawAccount.accountIndex}
          fingerprint={entry.rawAccount.fingerprint}
        />
      }
    />
  );
}

interface ExternalRecipientItemProps extends RecipientSelectorItemProps {
  entry: ExternalRecipientSuggestionEntry;
}

function ExternalRecipientItem({ entry, onSelect }: ExternalRecipientItemProps) {
  const { title, subtitle } = entry.bnsName
    ? { title: entry.bnsName, subtitle: truncateMiddle(entry.address) }
    : { title: truncateMiddle(entry.address) };

  return (
    <Cell.Root pressable={true} maxHeight={68} onPress={() => onSelect(entry.address)}>
      <Cell.Icon>
        <AccountAvatar icon={PersonIcon} />
      </Cell.Icon>
      <Cell.Content>
        <Cell.Label numberOfLines={1} ellipsizeMode="middle" variant="primary">
          {title}
        </Cell.Label>
        {subtitle && <Cell.Label variant="secondary">{subtitle}</Cell.Label>}
      </Cell.Content>
    </Cell.Root>
  );
}
