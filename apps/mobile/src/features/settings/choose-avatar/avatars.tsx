import { accountIconMap } from '@/features/accounts/components/account-avatar';
import { AccountIcon } from '@/store/accounts/utils';

import { Box } from '@leather.io/ui/native';

import { AvatarButton } from './avatar-button';

interface AvatarProps {
  setNewIcon(icon: AccountIcon): void;
  currentIcon: string;
}

export function Avatars({ setNewIcon, currentIcon }: AvatarProps) {
  return (
    <Box flexDirection="row" gap="5" flexWrap="wrap">
      {Object.keys(accountIconMap).map(icon => (
        <AvatarButton
          isSelected={currentIcon === icon}
          onPress={() => setNewIcon(icon)}
          key={icon}
          icon={icon}
        />
      ))}
    </Box>
  );
}
