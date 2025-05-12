import { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { HasChildren, Pressable, usePressedState } from '@leather.io/ui/native';

interface WidgetCardProps extends HasChildren {
  onPress?: () => void;
  height?: number;
}
export function WidgetCard({ children, onPress, height = 180, ...props }: WidgetCardProps) {
  const { pressed, onPressIn, onPressOut } = usePressedState();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed ? 0.95 : 1) }],
  }));
  return (
    <Pressable
      width={200}
      height={height}
      p="4"
      justifyContent="space-between"
      bg="ink.background-primary"
      borderWidth={1}
      borderStyle="solid"
      borderColor="ink.border-transparent"
      borderRadius="md"
      shadowOpacity={0.04}
      shadowOffset={{ width: 0, height: 2 }}
      shadowRadius={6}
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
