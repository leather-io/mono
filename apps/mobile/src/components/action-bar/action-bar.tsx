import { type ReactNode, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/store/settings/settings';
import { useTheme } from '@shopify/restyle';

import { BlurView, Box, Theme } from '@leather.io/ui/native';

export const ACTION_BAR_HEIGHT = 70;
export const ACTION_BAR_BOTTOM_OFFSET = 40;
export const ACTION_BAR_TOTAL_HEIGHT = ACTION_BAR_HEIGHT + ACTION_BAR_BOTTOM_OFFSET;

interface ActionBarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export interface ActionBarMethods {
  hide(): void;
  show(): void;
  isShown: boolean;
}

export const ActionBar = forwardRef<ActionBarMethods, ActionBarProps>(function (props, ref) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const { themeDerivedFromThemePreference } = useSettings();
  const animatedBottom = useSharedValue(ACTION_BAR_BOTTOM_OFFSET + bottom);
  const animatedOpacity = useSharedValue(1);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    bottom: animatedBottom.value,
    opacity: animatedOpacity.value,
  }));

  const [isShown, setIsShown] = useState(true);

  useImperativeHandle(
    ref,
    () => ({
      hide() {
        setIsShown(false);
      },
      show() {
        setIsShown(true);
      },
      isShown,
    }),
    [isShown]
  );

  useEffect(() => {
    if (isShown) {
      animatedBottom.value = withTiming(ACTION_BAR_BOTTOM_OFFSET + bottom, { duration: 300 });
      animatedOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.in(Easing.poly(6)),
      });
    } else {
      animatedBottom.value = withTiming(-200, { duration: 300 });
      animatedOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.poly(6)),
      });
    }
  }, [isShown]);

  return (
    <Animated.View
      style={[
        {
          width: '100%',
          position: 'absolute',
          height: ACTION_BAR_HEIGHT,
        },
        containerAnimatedStyle,
      ]}
    >
      <Box width="100%" px="5" justifyContent="center" alignItems="center">
        <BlurView
          themeVariant={themeDerivedFromThemePreference}
          intensity={90}
          style={{
            flexDirection: 'row',
            width: '100%',
            paddingHorizontal: theme.spacing[5],
            paddingVertical: theme.spacing[2],
            height: '100%',
            shadowColor: theme.colors['ink.background-overlay'],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            borderRadius: theme.borderRadii.xs,
          }}
        >
          {props.left && (
            <Box flex={1} flexDirection="row" justifyContent="center" alignItems="center">
              {props.left}
            </Box>
          )}
          {props.center && (
            <Box flex={1} flexDirection="row" justifyContent="center" alignItems="center">
              {props.center}
            </Box>
          )}
          {props.right && (
            <Box flex={1} flexDirection="row" justifyContent="center" alignItems="center">
              {props?.right}
            </Box>
          )}
        </BlurView>
      </Box>
    </Animated.View>
  );
});
