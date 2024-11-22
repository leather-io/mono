import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { PlusIcon, Theme } from '@leather.io/ui/native';

import { AccountCardLayout } from './account-card.layout';

export interface CreateWalletCardProps {
  onPress(): void;
}

export function CreateWalletCard({ onPress }: CreateWalletCardProps) {
  const theme = useTheme<Theme>();
  return (
    <AccountCardLayout
      onPress={onPress}
      width={300}
      icon={<PlusIcon color={theme.colors['ink.background-primary']} />}
      label={t({ id: 'create_wallet_card.title', message: 'Create or restore wallet' })}
      caption={t({
        id: 'create_wallet_card.caption',
        message: 'Create, Import or connect instantly',
      })}
      testID={TestId.homeCreateWalletCard}
    />
  );
}
