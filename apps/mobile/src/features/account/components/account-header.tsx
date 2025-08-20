import { AccountAvatar } from '@/features/account/components/account-avatar';
import { Account } from '@/store/accounts/accounts';

import { Box, ChevronDownIcon, Pressable, Text } from '@leather.io/ui/native';

interface AccountHeaderProps {
  account: Account;
  onPress?(): void;
}

export function AccountHeader({ account, onPress }: AccountHeaderProps) {
  const { icon, name } = account;
  return (
    <Pressable onPress={onPress} flexDirection="row" alignItems="center" gap="3">
      <AccountAvatar variant="sm" icon={icon} />
      <Box flexDirection="row" alignItems="center" gap="1">
        <Text variant="label01">{name}</Text>
        <ChevronDownIcon variant="small" />
      </Box>
    </Pressable>
  );
}
