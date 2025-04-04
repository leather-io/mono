import { AccountCard } from '@/features/accounts/components/account-card';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';

import { PlusIcon } from '@leather.io/ui/native';

export interface AddAccountCardProps {
  onPress(): void;
}

export function AddAccountCard({ onPress }: AddAccountCardProps) {
  return (
    <AccountCard
      onPress={onPress}
      width={200}
      icon={PlusIcon}
      primaryTitle={t({ id: 'add_account_card.title', message: 'Add account' })}
      testID={TestId.addAccountCard}
    />
  );
}
