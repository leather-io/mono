import { useCallback, useRef } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { t } from '@lingui/core/macro';

import { ArrowsRepeatLeftRightIcon, Pressable, usePressedState } from '@leather.io/ui/native';

interface FlipButtonProps {
  isVisible: boolean;
  onPress?(): void;
}

export function FlipButton({ isVisible, onPress }: FlipButtonProps) {
  const { pressed, onPressIn, onPressOut } = usePressedState();
  const rotation = useSharedValue(90);
  const rotationDirection = useRef(1);

  const handlePress = useCallback(() => {
    rotation.value = withTiming(rotation.value + 180 * rotationDirection.current, {
      duration: 300,
    });
    rotationDirection.current *= -1;
    onPress?.();
  }, [rotation, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.9 : 1) }, { rotate: `${rotation.value}deg` }],
  }));

  if (!isVisible) return null;

  return (
    <Pressable
      entering={enteringAnimation}
      width={32}
      height={32}
      justifyContent="center"
      alignItems="center"
      bg="ink.background-primary"
      position="absolute"
      top={86}
      left="50%"
      marginLeft="2"
      borderWidth={1}
      borderRadius="round"
      borderColor="ink.border-transparent"
      accessibilityLabel={t`Flip assets`}
      zIndex="10"
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}
      style={animatedStyle}
      hitSlop={12}
    >
      <ArrowsRepeatLeftRightIcon variant="small" />
    </Pressable>
  );
}

function enteringAnimation() {
  'worklet';
  const delay = 60;
  const springConfig = { damping: 15, stiffness: 200 };

  return {
    initialValues: {
      opacity: 0,
      transform: [{ scale: 0.9 }, { rotate: '90deg' }],
    },
    animations: {
      opacity: withDelay(delay, withSpring(1, springConfig)),
      transform: [
        { scale: withDelay(delay, withSpring(1, springConfig)) },
        { rotate: withDelay(delay, withSpring('90deg', springConfig)) },
      ],
    },
  };
}
