import { ReactNode } from 'react';

import { Box, Pressable, legacyTouchablePressEffect } from '@leather.io/ui/native';

interface WidgetHeaderProps {
  children: ReactNode;
  onPress?(): void;
  dataTestId?: string;
}

export function WidgetHeader({ children, onPress, dataTestId }: WidgetHeaderProps) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} pressEffects={legacyTouchablePressEffect}>
        <Box flexDirection="row" gap="1" alignItems="center" px="5" testID={dataTestId}>
          {children}
        </Box>
      </Pressable>
    );
  }

  return (
    <Box flexDirection="row" gap="1" alignItems="center" px="5" testID={dataTestId}>
      {children}
    </Box>
  );
}
