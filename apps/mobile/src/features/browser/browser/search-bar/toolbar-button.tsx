import { ReactNode } from 'react';

import { Pressable, Text, legacyTouchablePressEffect } from '@leather.io/ui/native';

interface ToolbarButtonProps {
  onPress(): void;
  icon: ReactNode;
  label: string;
}

export function ToolbarButton({ onPress, icon, label }: ToolbarButtonProps) {
  return (
    <Pressable
      pressEffects={legacyTouchablePressEffect}
      onPress={onPress}
      py="3"
      gap="1"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
    >
      {icon}
      <Text variant="label03">{label}</Text>
    </Pressable>
  );
}
