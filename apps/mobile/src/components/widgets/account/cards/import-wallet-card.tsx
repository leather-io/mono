import { t } from '@lingui/macro';

import { PlusIcon } from '@leather.io/ui/native';

import { AccountCardLayout } from './account-card.layout';

export interface ImportWalletCardProps {
  onPress(): void;
}

export function ImportWalletCard({ onPress }: ImportWalletCardProps) {
  return (
    <AccountCardLayout
      onPress={onPress}
      Icon={PlusIcon}
      label={t`Import wallet`}
      caption={t`One place, all wallets`}
    />
  );
}
