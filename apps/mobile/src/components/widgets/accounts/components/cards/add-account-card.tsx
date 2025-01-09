import { t } from '@lingui/macro';

import { PlusIcon, SquircleBox } from '@leather.io/ui/native';

import { AccountCardLayout } from './account-card.layout';

export interface AddAccountCardProps {
  onPress(): void;
}

export function AddAccountCard({ onPress }: AddAccountCardProps) {
  return (
    <AccountCardLayout
      onPress={onPress}
      icon={
        // TODO: Temporary one off. Needs a custom Avatar
        <SquircleBox
          width={48}
          height={48}
          borderWidth={1}
          borderColor="ink.border-default"
          borderRadius={18}
          cornerSmoothing={100}
          preserveSmoothing={true}
          justifyContent="center"
          alignItems="center"
        >
          <PlusIcon />
        </SquircleBox>
      }
      label={t({ id: 'add_account_card.title', message: 'Add account' })}
      caption={t({ id: 'add_account_card.caption', message: 'All accounts in one' })}
    />
  );
}
