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
      Icon={PlusIcon}
      label={t`Add account`}
      caption={t`All accounts in one place`}
    />
  );
}
