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
      p="1"
      gap="1"
      justifyContent="center"
      alignItems="center"
    >
      {icon}
      <Text>{label}</Text>
    </Pressable>
  );
}
