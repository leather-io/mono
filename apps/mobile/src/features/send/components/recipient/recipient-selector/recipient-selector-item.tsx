import { AccountListItem } from '@/features/account/account-list/account-list-item';
import { AccountAddress } from '@/features/account/components/account-address';
import { AccountAvatar } from '@/features/account/components/account-avatar';
import { AccountBalance } from '@/features/balances/total-balance';
import {
  ExternalRecipientSuggestionEntry,
  InternalRecipientSuggestionEntry,
  RecipientSuggestionEntry,
} from '@/features/send/components/recipient/recipient.types';
import { useWalletByFingerprint } from '@/store/wallets/wallets.read';
import { analytics } from '@/utils/analytics';
import dayjs from 'dayjs';

import { FungibleCryptoAsset } from '@leather.io/models';
import {
  ArrowTopRightIcon,
  Avatar,
  BitcoinFilledCircleIcon,
  Cell,
  StacksFilledCircleIcon,
} from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

interface RecipientSelectorItemProps {
  entry: RecipientSuggestionEntry;
  onSelect(address: string): void;
  asset: FungibleCryptoAsset;
}

export function RecipientSelectorItem({ entry, onSelect, asset }: RecipientSelectorItemProps) {
  function handleSelect(address: string) {
    analytics.track('send_recipient_selected', { type: entry.type });
    onSelect(address);
  }

  switch (entry.type) {
    case 'internal':
      return <InternalRecipientItem entry={entry} onSelect={handleSelect} asset={asset} />;
    case 'external':
      return <ExternalRecipientItem entry={entry} onSelect={handleSelect} asset={asset} />;
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

function ExternalRecipientItem({ entry, onSelect, asset }: ExternalRecipientItemProps) {
  const { title, subtitle } = entry.bnsName
    ? {
        title: entry.bnsName,
        subtitle: entry.address,
      }
    : {
        title: entry.address,
        subtitle: entry.timestamp ? dayjs.unix(entry.timestamp).fromNow() : undefined,
      };

  const indicatorIcon = {
    BTC: <BitcoinFilledCircleIcon variant="small" />,
    STX: <StacksFilledCircleIcon variant="small" />,
  }[asset.symbol];

  return (
    <Cell.Root pressable={true} maxHeight={68} onPress={() => onSelect(entry.address)}>
      <Cell.Icon>
        <Avatar icon={<ArrowTopRightIcon />} indicator={indicatorIcon} />
      </Cell.Icon>
      <Cell.Content>
        <Cell.Label
          variant="primary"
          numberOfLines={1}
          ellipsizeMode="middle"
          style={{ width: 240 }}
        >
          {title}
        </Cell.Label>
        {subtitle && (
          <Cell.Label variant="secondary" numberOfLines={1} ellipsizeMode="middle">
            {subtitle}
          </Cell.Label>
        )}
      </Cell.Content>
    </Cell.Root>
  );
}
