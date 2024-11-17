import { ReactNode } from 'react';

import { Box, TouchableOpacity } from '@leather.io/ui/native';

interface WidgetHeaderProps {
  children: ReactNode;
  onPress?(): void;
}

export function WidgetHeader({ children, onPress }: WidgetHeaderProps) {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <Box flexDirection="row" gap="1" alignItems="center" px="5">
          {children}
        </Box>
      </TouchableOpacity>
    );
  }

  return (
    <Box flexDirection="row" gap="1" alignItems="center" px="5">
      {children}
    </Box>
  );
}
