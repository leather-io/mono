import { Box, HasChildren } from '@leather.io/ui/native';

export function SwapReviewFooter({ children }: HasChildren) {
  return (
    <Box gap="4" px="5" marginTop="auto">
      {children}
    </Box>
  );
}
