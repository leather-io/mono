import { HasChildren } from '@/utils/types';

import { Box } from '@leather.io/ui/native';

export function SettingsScreenLayout({ children }: HasChildren) {
  return (
    <Box bg="ink.background-primary" flex={1}>
      <Box flex={1} gap="3" paddingHorizontal="5" paddingTop="5">
        {children}
      </Box>
    </Box>
  );
}
