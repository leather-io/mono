import { HasChildren } from '@/utils/types';

import { Box } from '@leather.io/ui/native';

export function SendFormFooterLayout({ children }: HasChildren) {
  return (
    <Box flex={1} justifyContent="flex-end">
      {children}
    </Box>
  );
}
