import { WalletStore } from '@/store/wallets/utils';

import { AccountCardLayout } from './account-card.layout';

export interface AccountCardProps {
  onPress(): void;
  caption: string;
  label: React.ReactNode;
  icon: React.ReactNode;
  type: WalletStore['type'];
  testID?: string;
}
export function AccountCard({ onPress, caption, label, icon, type, testID }: AccountCardProps) {
  return (
    <AccountCardLayout
      icon={icon}
      label={label}
      caption={caption}
      onPress={onPress}
      type={type}
      testID={testID}
    />
  );
}
