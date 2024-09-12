import { t } from '@lingui/macro';

import { PlusIcon } from '@leather.io/ui/native';

import { AccountCardLayout } from './account-card.layout';

export interface CreateWalletCardProps {
  onPress(): void;
}

export function CreateWalletCard({ onPress }: CreateWalletCardProps) {
  return (
    <AccountCardLayout
      onPress={onPress}
      width={300}
      Icon={PlusIcon}
      label={t`Create or restore wallet`}
      caption={t`Create, Import or connect instantly`}
    />
  );
}
