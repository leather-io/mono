import { AccountAvatar, AccountIcon } from '@/features/accounts/components/account-avatar';

import { Pressable } from '@leather.io/ui/native';

interface AvatarButtonProps {
  icon: AccountIcon;
  onPress(): void;
  isSelected: boolean;
}
export function AvatarButton({ icon, onPress, isSelected }: AvatarButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <AccountAvatar
        icon={icon}
        borderColor={isSelected ? 'ink.action-primary-default' : 'ink.border-default'}
      />
    </Pressable>
  );
}
