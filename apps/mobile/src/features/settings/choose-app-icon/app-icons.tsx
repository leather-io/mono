import { View, useWindowDimensions } from 'react-native';

import { Box, useTheme } from '@leather.io/ui/native';

import { AppIconButton } from './app-icon-button';
import { type AppIcon } from './app-icon.utils';

interface AppIconsProps {
  setNewIcon(icon: AppIcon): void;
  currentIcon: AppIcon;
  availableIcons: readonly AppIcon[];
}

const COLUMNS = 4;
const GAP = 12;

export function AppIcons({ setNewIcon, currentIcon, availableIcons }: AppIconsProps) {
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();
  const containerWidth = windowWidth - 2 * theme.spacing['5'];
  const totalGapWidth = GAP * (COLUMNS - 1);
  const iconSize = containerWidth > 0 ? Math.floor((containerWidth - totalGapWidth) / COLUMNS) : 0;

  return (
    <Box px="5">
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: GAP,
        }}
      >
        {iconSize > 0 &&
          availableIcons.map(icon => (
            <AppIconButton
              isSelected={currentIcon === icon}
              onPress={() => setNewIcon(icon)}
              key={icon}
              icon={icon}
              size={iconSize}
            />
          ))}
      </View>
    </Box>
  );
}
