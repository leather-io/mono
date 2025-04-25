import { Box, HasChildren } from '@leather.io/ui/native';

export function CollectiblesLayout({ children }: HasChildren) {
  return (
    <Box flexDirection="row" alignItems="center" paddingHorizontal="5" gap="4" flexWrap="wrap">
      {children}
    </Box>
  );
}
