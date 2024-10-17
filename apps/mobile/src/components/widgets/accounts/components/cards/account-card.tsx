import { WalletStore } from '@/store/wallets/utils';

import { IconProps } from '@leather.io/ui/native';

import { AccountCardLayout } from './account-card.layout';

export interface AccountCardProps {
  onPress(): void;
  caption: string;
  label: React.ReactNode;
  Icon: React.FC<IconProps>;
  type: WalletStore['type'];
  testID?: string;
}

export function AccountCard({ onPress, caption, label, Icon, type, testID }: AccountCardProps) {
  return (
    <AccountCardLayout
      Icon={Icon}
      label={label}
      caption={caption}
      onPress={onPress}
      type={type}
      testID={testID}
    />
  );
}
