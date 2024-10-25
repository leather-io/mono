import { t } from '@lingui/macro';

import { PlusIcon } from '@leather.io/ui/native';

import { AccountCardLayout } from './account-card.layout';

export interface AddAccountCardProps {
  onPress(): void;
}

export function AddAccountCard({ onPress }: AddAccountCardProps) {
  return (
    <AccountCardLayout
      onPress={onPress}
      icon={<PlusIcon />}
      label={t({ id: 'add_account_card.title', message: 'Add account' })}
      caption={t({ id: 'add_account_card.caption', message: 'All accounts in one' })}
    />
  );
}
