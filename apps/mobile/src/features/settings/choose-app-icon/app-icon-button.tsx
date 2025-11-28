import { Image, View } from 'react-native';

import { Pressable, useTheme } from '@leather.io/ui/native';

import { type AppIcon, appIconAssets } from './app-icon.utils';

interface AppIconButtonProps {
  icon: AppIcon;
  onPress(): void;
  isSelected: boolean;
  size: number;
}

const INNER_BORDER_WIDTH = 3;

export function AppIconButton({ icon, onPress, isSelected, size }: AppIconButtonProps) {
  const theme = useTheme();
  const borderColor = isSelected
    ? theme.colors['ink.action-primary-default']
    : theme.colors['ink.border-default'];
  const borderRadius = size * 0.22;

  return (
    <Pressable testID={`app-icon-${icon}`} onPress={onPress}>
      <View
        style={{
          borderColor,
          borderWidth: isSelected ? 2 : 1,
          width: size,
          height: size,
          borderRadius,
          overflow: 'hidden',
          padding: isSelected ? INNER_BORDER_WIDTH : 0,
          backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
        }}
      >
        <Image
          source={appIconAssets[icon]}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: isSelected ? borderRadius - INNER_BORDER_WIDTH - 2 : borderRadius - 1,
          }}
          resizeMode="cover"
        />
      </View>
    </Pressable>
  );
}
