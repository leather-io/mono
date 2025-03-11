import { ReactNode } from 'react';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { useTheme } from '@shopify/restyle';

import { BoxProps, Theme } from '@leather.io/ui/native';

import { secondaryTitleVisibilityThreshold } from '../animated-header/animated-header.hooks';
import { HeaderSubtitle, HeaderTitle } from './header-title';

interface ReversibleHeaderProps extends BoxProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  testID?: string;
  scrollY: SharedValue<number>;
}

export function ReversibleHeader({ title, subtitle, testID, scrollY }: ReversibleHeaderProps) {
  const theme = useTheme<Theme>();
  const reverseThreshold = secondaryTitleVisibilityThreshold;
  // update the container style based on the scrollY value to flip the header
  const containerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      paddingHorizontal: theme.spacing[5],
      flexDirection: scrollY.value >= reverseThreshold ? 'column-reverse' : 'column',
      alignItems: scrollY.value >= reverseThreshold ? 'center' : 'flex-start',
      justifyContent: scrollY.value >= reverseThreshold ? 'center' : 'flex-start',
    };
  });

  return (
    <Animated.View style={containerStyle}>
      {typeof title === 'string' ? <HeaderTitle title={title} testID={testID} /> : title}

      {subtitle && (typeof subtitle === 'string' ? <HeaderSubtitle title={subtitle} /> : subtitle)}
    </Animated.View>
  );
}
