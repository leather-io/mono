import { ReactNode } from 'react';

import { Box, Text } from '@leather.io/ui/native';

interface TabButtonProps {
  title: string;
  icon: ReactNode;
}

export function TabButton({ title, icon }: TabButtonProps) {
  return (
    <Box justifyContent="center" alignItems="center" gap="1" paddingBottom="3" paddingTop="3">
      {icon}
      <Text variant="label03">{title}</Text>
    </Box>
  );
}
