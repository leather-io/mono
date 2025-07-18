import { ReactNode } from 'react';

import { TabTriggerSlotProps } from 'expo-router/ui';

import { Pressable, Text, legacyTouchablePressEffect } from '@leather.io/ui/native';

interface TabButtonProps extends Omit<TabTriggerSlotProps, 'ref'> {
  title: string;
  activeIcon: ReactNode;
  defaultIcon: ReactNode;
}

export function TabButton({ title, activeIcon, defaultIcon, isFocused, ...props }: TabButtonProps) {
  return (
    <Pressable
      {...props}
      pressEffects={legacyTouchablePressEffect}
      justifyContent="center"
      alignItems="center"
      gap="1"
      paddingBottom="3"
      paddingTop="3"
    >
      {isFocused ? activeIcon : defaultIcon}
      <Text variant="label03">{title}</Text>
    </Pressable>
  );
}
