import { ReactNode } from 'react';

import { TabTriggerSlotProps, useTabTrigger } from 'expo-router/ui';

import { Pressable, Text, legacyTouchablePressEffect } from '@leather.io/ui/native';

interface TabButtonProps extends Omit<TabTriggerSlotProps, 'ref'> {
  title: string;
  activeIcon: ReactNode;
  defaultIcon: ReactNode;
  name: string;
  toggleGradient(): void;
}

export function TabButton({
  title,
  activeIcon,
  defaultIcon,
  isFocused,
  toggleGradient,
  ...props
}: TabButtonProps) {
  const { switchTab } = useTabTrigger({ name: props.name });
  return (
    <Pressable
      {...props}
      onPress={() => {
        toggleGradient();
        switchTab(props.name, {});
      }}
      pressEffects={legacyTouchablePressEffect}
      justifyContent="center"
      alignItems="center"
      gap="1"
      paddingBottom="2"
      paddingTop="3"
    >
      {isFocused ? activeIcon : defaultIcon}
      <Text variant="label03">{title}</Text>
    </Pressable>
  );
}
