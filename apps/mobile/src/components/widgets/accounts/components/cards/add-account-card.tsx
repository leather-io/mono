import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { PlusIcon, Theme } from '@leather.io/ui/native';

import { AccountCardLayout } from './account-card.layout';

export interface AddAccountCardProps {
  onPress(): void;
}

export function AddAccountCard({ onPress }: AddAccountCardProps) {
  const theme = useTheme<Theme>();

  return (
    <AccountCardLayout
      onPress={onPress}
      icon={<PlusIcon color={theme.colors['ink.background-primary']} />}
      label={t({ id: 'add_account_card.title', message: 'Add account' })}
      caption={t({ id: 'add_account_card.caption', message: 'All accounts in one' })}
    />
  );
}
