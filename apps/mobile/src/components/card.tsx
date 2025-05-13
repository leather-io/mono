import { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { Pressable, PressableProps, usePressedState } from '@leather.io/ui/native';

interface CardProps extends PressableProps {
  onPress?: () => void;
  height?: number;
}
export function Card({ children, onPress, height = 180, ...props }: CardProps) {
  const { pressed, onPressIn, onPressOut } = usePressedState();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed ? 0.95 : 1) }],
  }));
  return (
    <Pressable
      height={height}
      p="4"
      justifyContent="space-between"
      bg="ink.background-primary"
      borderWidth={1}
      borderStyle="solid"
      borderColor="ink.border-transparent"
      borderRadius="md"
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      pressEffects={{
        opacity: { from: 1, to: 0.95 },
      }}
      style={animatedStyle}
      {...props}
    >
      {children}
    </Pressable>
  );
}
