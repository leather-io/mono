import { WalletStore } from '@/store/wallets/wallets.write';

import { IconProps } from '@leather.io/ui/native';

import { AccountCardLayout } from './account-card.layout';

export interface AccountCardProps {
  onPress(): void;
  caption: string;
  label: React.ReactNode;
  Icon: React.FC<IconProps>;
  type: WalletStore['type'];
}

export function AccountCard({ onPress, caption, label, Icon, type }: AccountCardProps) {
  return (
    <AccountCardLayout Icon={Icon} label={label} caption={caption} onPress={onPress} type={type} />
  );
}
