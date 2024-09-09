import { iconNames } from '@/components/avatar-icon';

import { Box } from '@leather.io/ui/native';

import { AvatarButton } from './avatar-button';

interface AvatarProps {
  setNewIcon(icon: string): void;
  currentIcon: string;
}

export function Avatars({ setNewIcon, currentIcon }: AvatarProps) {
  return (
    <Box flexDirection="row" gap="5" flexWrap="wrap">
      {iconNames.map(icon => {
        return (
          <AvatarButton
            isSelected={currentIcon === icon}
            onPress={() => {
              setNewIcon(icon);
            }}
            key={icon}
            icon={icon}
          />
        );
      })}
    </Box>
  );
}
