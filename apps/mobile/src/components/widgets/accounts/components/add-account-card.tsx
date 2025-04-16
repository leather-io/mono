import { AccountCard } from '@/features/accounts/components/account-card';
import { t } from '@lingui/macro';

import { PlusIcon } from '@leather.io/ui/native';

interface AddAccountCardProps {
  onPress(): void;
}

export function AddAccountCard({ onPress }: AddAccountCardProps) {
  return (
    <AccountCard
      onPress={onPress}
      width={200}
      icon={PlusIcon}
      primaryTitle={t({ id: 'add_account_card.title', message: 'Add account' })}
    />
  );
}
