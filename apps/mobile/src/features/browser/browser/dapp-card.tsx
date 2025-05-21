import { ReactNode } from 'react';
import { Dimensions, Platform } from 'react-native';

import { useSettings } from '@/store/settings/settings';
import { useTheme } from '@shopify/restyle';
import { Image } from 'expo-image';

import { BlurView, Box, Pressable, Text, Theme } from '@leather.io/ui/native';

const dAppImageAspectRatio = 342 / 400;
const { width: screenWidth } = Dimensions.get('window');

interface CaptionWrapperProps {
  children: ReactNode;
}

// TODO: this is used until we figure out the BlurView for android
function CaptionWrapper({ children }: CaptionWrapperProps) {
  const { themeDerivedFromThemePreference } = useSettings();
  switch (Platform.OS) {
    case 'android':
      return <Box backgroundColor="ink.background-primary">{children}</Box>;
    case 'ios':
      return <BlurView themeVariant={themeDerivedFromThemePreference}>{children}</BlurView>;
    default:
      return null;
  }
}

interface DappCardProps {
  title: string;
  caption: string;
  imageSrc: string;
  onPress(): void;
  icon: ReactNode;
}
export function DappCard({ imageSrc, icon, title, caption, onPress }: DappCardProps) {
  const theme = useTheme<Theme>();
  const width = screenWidth - 2 * theme.spacing['5'];
  return (
    <Pressable onPress={onPress} borderRadius="md" overflow="hidden">
      <Image
        source={imageSrc}
        style={{
          width: '100%',
          height: width / dAppImageAspectRatio,
        }}
      />
      <Box position="absolute" bottom={0} left={0} right={0}>
        <CaptionWrapper>
          <Box px="3" py="4" gap="3" flexDirection="row" alignItems="center">
            {icon}
            <Box flexShrink={1}>
              <Text color="ink.background-secondary" variant="label02" pb="1">
                {title}
              </Text>
              <Text color="ink.background-secondary" variant="caption01">
                {caption}
              </Text>
            </Box>
          </Box>
        </CaptionWrapper>
      </Box>
    </Pressable>
  );
}
