import { useTheme } from '@shopify/restyle';
import { Image } from 'expo-image';

import { Box, Theme } from '@leather.io/ui/native';

interface AppIconsProps {
  appIcons: string[];
}
export function AppIcons({ appIcons }: AppIconsProps) {
  const { spacing, colors } = useTheme<Theme>();
  return (
    <Box position="absolute" right={spacing['4']} top={spacing['7']} flexDirection="row">
      {appIcons.slice(0, 8).map((icon, idx) => (
        <Image
          key={icon}
          style={{
            position: 'absolute',
            width: 18,
            height: 18,
            right: idx * spacing[4],
            zIndex: (100 - idx) * 1,
            borderRadius: 999,
            borderColor: colors['ink.background-primary'],
            borderWidth: 1,
          }}
          source={{ uri: icon }}
        />
      ))}
    </Box>
  );
}
