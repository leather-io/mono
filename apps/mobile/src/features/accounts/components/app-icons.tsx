import { useTheme } from '@shopify/restyle';

import { Box, Favicon, Theme } from '@leather.io/ui/native';

interface AppIconsProps {
  appOrigins: string[];
}
export function AppIcons({ appOrigins }: AppIconsProps) {
  const { spacing } = useTheme<Theme>();
  return (
    <Box position="absolute" right={spacing['4']} top={spacing['7']} flexDirection="row">
      {appOrigins.slice(0, 8).map((origin, idx) => (
        <Box
          key={origin}
          position="absolute"
          width={18}
          height={18}
          right={idx * spacing[4]}
          borderRadius="round"
          borderColor="ink.background-primary"
          borderWidth={1}
          style={{
            zIndex: (100 - idx) * 1,
          }}
        >
          <Favicon origin={origin} size={16} />
        </Box>
      ))}
    </Box>
  );
}
