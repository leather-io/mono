import React from 'react';

import { Box } from '@leather.io/ui/native';

interface WidgetProps {
  children: React.ReactNode;
}

export function Widget({ children }: WidgetProps) {
  return (
    <Box p="5" flexDirection="column" gap="3">
      {children}
    </Box>
  );
}
