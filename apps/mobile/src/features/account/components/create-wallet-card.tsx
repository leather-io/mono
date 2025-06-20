import { Dimensions } from 'react-native';

import { AccountCard } from '@/features/account/components/account-card';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { PlusIcon, Theme } from '@leather.io/ui/native';

interface CreateWalletCardProps {
  onPress(): void;
}

export function CreateWalletCard({ onPress }: CreateWalletCardProps) {
  const theme = useTheme<Theme>();
  const width = Dimensions.get('screen').width - theme.spacing['5'] * 2;

  return (
    <AccountCard
      onPress={onPress}
      width={width}
      icon={PlusIcon}
      //  this lingui shit is killing me. I was working on the wrong file as I used the UI text
      // here we actually show 'Add account' in the UI for this card
      primaryTitle={t({ id: 'create_wallet_card.title', message: 'Create or restore wallet' })}
      caption={t({
        id: 'create_wallet_card.caption',
        message: 'Create, Import or connect instantly',
      })}
      testID={TestId.homeCreateWalletCard}
    />
  );
}
