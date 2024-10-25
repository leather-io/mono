import { AvatarIcon, AvatarIconName } from '@/components/avatar-icon';
import { defaultIconTestId } from '@/utils/testing-utils';
import { useTheme } from '@shopify/restyle';

import { Box, Theme, TouchableOpacity } from '@leather.io/ui/native';

interface AvatarButtonProps {
  iconName: AvatarIconName;
  onPress(): void;
  isSelected: boolean;
}
export function AvatarButton({ iconName, onPress, isSelected }: AvatarButtonProps) {
  const theme = useTheme<Theme>();
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
        testID={defaultIconTestId(iconName)}
        borderWidth={2}
        borderColor="ink.background-primary"
        onPress={onPress}
        style={{ padding: 6 }}
        borderRadius="round"
        bg="ink.text-primary"
      >
        <AvatarIcon
          color={theme.colors['ink.background-primary']}
          icon={iconName}
          width={32}
          height={32}
        />
      </TouchableOpacity>
    </Box>
  );
}
