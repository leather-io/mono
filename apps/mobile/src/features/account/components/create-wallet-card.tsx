import { Dimensions } from 'react-native';

import { AccountCard } from '@/features/account/components/account-card';
import { HomeSelectors } from '@/shared/selectors/home.selectors';
import { t } from '@lingui/core/macro';

import { PlusIcon, useTheme } from '@leather.io/ui/native';

interface CreateWalletCardProps {
  onPress(): void;
}

export function CreateWalletCard({ onPress }: CreateWalletCardProps) {
  const theme = useTheme();
  const width = Dimensions.get('window').width - theme.spacing['5'] * 2;

  return (
    <AccountCard
      onPress={onPress}
      width={width}
      icon={PlusIcon}
      primaryTitle={t`Add account`}
      testID={HomeSelectors.CreateWalletCard}
    />
  );
}
