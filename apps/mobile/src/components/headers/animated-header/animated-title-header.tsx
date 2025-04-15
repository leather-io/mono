import { ReactNode } from 'react';
import Animated, { AnimatedStyle, SharedValue } from 'react-native-reanimated';

import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { Box, Theme } from '@leather.io/ui/native';

import { ReversibleHeader } from '../components/animated-reversible-header';
import { HeaderBackButton } from '../components/header-back-button';
import { HeaderTitle } from '../components/header-title';
import { HeaderTitleWithSubtitle } from '../components/header-title-with-subtitle';
import { HeaderLayout } from '../header.layout';

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface AnimatedTitleHeaderProps {
  animatedStyle: AnimatedStyle;
  animatedBlurOverlayStyle: AnimatedStyle;
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  scrollY?: SharedValue<number>;
  rightElement?: ReactNode;
  isHeaderReversible?: boolean;
}
export function AnimatedTitleHeader({
  animatedStyle,
  title,
  subtitle,
  rightElement,
  scrollY,
  animatedBlurOverlayStyle,
  isHeaderReversible = false,
}: AnimatedTitleHeaderProps) {
  const router = useRouter();
  const { themeDerivedFromThemePreference } = useSettings();
  const theme = useTheme<Theme>();
  const gradientTransparentStopColor =
    themeDerivedFromThemePreference === 'light' ? 'rgba(255,255,255,0)' : 'rgba(27,26,23,0)';

  return (
    <Box zIndex="10">
      <HeaderLayout
        leftElement={<HeaderBackButton onPress={() => router.back()} testID={TestId.backButton} />}
        centerElement={
          <AnimatedBox style={animatedStyle}>
            {subtitle ? (
              isHeaderReversible && scrollY ? (
                <ReversibleHeader title={title} subtitle={subtitle} scrollY={scrollY} />
              ) : (
                <HeaderTitleWithSubtitle title={title} subtitle={subtitle} />
              )
            ) : (
              <HeaderTitle title={title} />
            )}
          </AnimatedBox>
        }
        rightElement={rightElement}
      />
      <AnimatedBox style={animatedBlurOverlayStyle}>
        <LinearGradient
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            left: 0,
            height: 22,
          }}
          colors={[theme.colors['ink.background-primary'], gradientTransparentStopColor]}
        />
      </AnimatedBox>
    </Box>
  );
}
