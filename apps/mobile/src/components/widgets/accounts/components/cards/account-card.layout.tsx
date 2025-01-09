import { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { Box, Pressable, Text, usePressedState } from '@leather.io/ui/native';

export interface AccountCardLayoutProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  caption: string;
  onPress(): void;
  width?: number;
  testID?: string;
}
export function AccountCardLayout({
  onPress,
  icon,
  label,
  caption,
  width = 200,
  testID,
}: AccountCardLayoutProps) {
  const { pressed, onPressIn, onPressOut } = usePressedState();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed ? 0.95 : 1) }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      haptics="soft"
      width={width}
      height={180}
      p="5"
      borderRadius="sm"
      borderColor="ink.border-transparent"
      borderWidth={1}
      alignItems="flex-start"
      justifyContent="space-between"
      style={animatedStyle}
      testID={testID}
    >
      {icon}
      <Box gap="1">
        <Text variant="label01">{label}</Text>
        <Text variant="caption01" color="ink.text-subdued">
          {caption}
        </Text>
      </Box>
    </Pressable>
  );
}
