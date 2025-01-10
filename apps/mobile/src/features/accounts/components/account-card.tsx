import { ComponentType, ReactNode } from 'react';
import { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { AccountAvatar, AccountIcon } from '@/features/accounts/components/account-avatar';
import { HasChildren } from '@/utils/types';

import { Box, Pressable, PressableProps, Text, usePressedState } from '@leather.io/ui/native';
import { isString } from '@leather.io/utils';

interface AccountCardProps extends PressableProps {
  icon: AccountIcon | ComponentType;
  caption?: string;
  primaryTitle: ReactNode;
  secondaryTitle?: ReactNode;
  address?: ReactNode;
  onPress?(): void;
  onLongPress?(): void;
  testID?: string;
  iconTestID?: string;
}

export function AccountCard({
  caption,
  primaryTitle,
  secondaryTitle,
  icon,
  address,
  onPress,
  ...props
}: AccountCardProps) {
  const { pressed, onPressIn, onPressOut } = usePressedState(props);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed ? 0.95 : 1) }],
  }));

  return (
    <Pressable
      height={156}
      p="4"
      justifyContent="space-between"
      bg="ink.background-primary"
      borderWidth={1}
      borderStyle="solid"
      borderColor="ink.border-default"
      borderRadius="md"
      shadowOpacity={0.04}
      shadowOffset={{ width: 0, height: 2 }}
      shadowRadius={6}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={animatedStyle}
      {...props}
    >
      <Box flexDirection="row" justifyContent="space-between">
        <AccountAvatar icon={icon} />
        {address}
      </Box>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="flex-end"
        gap="2"
        mb="-0.5"
      >
        <Box gap="0.5" flexShrink={1}>
          {caption && (
            <Text variant="label03" numberOfLines={1}>
              {caption}
            </Text>
          )}
          <Title>{primaryTitle}</Title>
        </Box>
        <Title>{secondaryTitle}</Title>
      </Box>
    </Pressable>
  );
}

function Title({ children }: HasChildren) {
  if (!children) {
    return null;
  }

  if (isString(children)) {
    return (
      <Text variant="label01" numberOfLines={1}>
        {children}
      </Text>
    );
  }

  return children;
}
