import { ComponentProps } from 'react';
import Animated, { SharedValue, useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';

interface FadingViewProps extends ComponentProps<typeof Animated.View> {
  opacity: SharedValue<number>;
}

export function FadingView({ opacity, animatedProps, style, ...props }: FadingViewProps) {
  const _animatedProps = useAnimatedProps(() => {
    return { pointerEvents: opacity.value > 0.5 ? 'auto' : 'none' } as const;
  });
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[style, animatedStyle]}
      animatedProps={{ ..._animatedProps, ...animatedProps }}
      {...props}
    />
  );
}
