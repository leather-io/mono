import { AccountAvatar } from '@/features/accounts/components/account-avatar';
import { AccountIcon } from '@/store/accounts/utils';
import { defaultIconTestId } from '@/utils/testing-utils';

import { Pressable } from '@leather.io/ui/native';

interface AvatarButtonProps {
  icon: AccountIcon;
  onPress(): void;
  isSelected: boolean;
}
export function AvatarButton({ icon, onPress, isSelected }: AvatarButtonProps) {
  return (
    <Pressable testID={defaultIconTestId(icon)} onPress={onPress}>
      <AccountAvatar
        icon={icon}
        borderColor={isSelected ? 'ink.action-primary-default' : 'ink.border-default'}
      />
    </Pressable>
  );
}
