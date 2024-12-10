import { AvatarIcon, AvatarIconName } from '@/components/avatar-icon';
import { defaultIconTestId } from '@/utils/testing-utils';
import { useTheme } from '@shopify/restyle';

import { Box, Pressable, Theme, legacyTouchablePressEffect } from '@leather.io/ui/native';

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
      <Pressable
        testID={defaultIconTestId(iconName)}
        borderWidth={2}
        borderColor="ink.background-primary"
        onPress={onPress}
        style={{ padding: 6 }}
        borderRadius="round"
        bg="ink.text-primary"
        pressEffects={legacyTouchablePressEffect}
      >
        <AvatarIcon
          color={theme.colors['ink.background-primary']}
          icon={iconName}
          width={32}
          height={32}
        />
      </Pressable>
    </Box>
  );
}
