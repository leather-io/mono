import { getAvatarIcon } from '@/components/avatar-icon';
import { useTheme } from '@shopify/restyle';

import { Box, Theme, TouchableOpacity } from '@leather.io/ui/native';

interface AvatarButtonProps {
  icon: string;
  onPress(): void;
  isSelected: boolean;
}

export function AvatarButton({ icon, onPress, isSelected }: AvatarButtonProps) {
  const theme = useTheme<Theme>();
  const Icon = getAvatarIcon(icon);
  return (
    <Box>
      {isSelected && (
        <Box
          width={52}
          height={52}
          left={-2}
          top={-2}
          borderRadius="round"
          bg="ink.text-primary"
          position="absolute"
        />
      )}
      <TouchableOpacity
        borderWidth={2}
        borderColor="ink.background-primary"
        onPress={onPress}
        style={{ padding: 6 }}
        borderRadius="round"
        bg="ink.text-primary"
      >
        <Icon width={32} height={32} color={theme.colors['ink.background-primary']} />
      </TouchableOpacity>
    </Box>
  );
}
