import { HasChildren } from '@/utils/types';

import { Box } from '@leather.io/ui/native';

export function SendFormContainer({ children }: HasChildren) {
  return (
    <Box flex={1} gap="3">
      {children}
    </Box>
  );
}
