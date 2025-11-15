import { Box, SkeletonLoader } from '@leather.io/ui/native';

export function QuotePreviewLoadingIndicator() {
  return (
    <Box px="4" mt="5" gap="2" height={64}>
      <SkeletonLoader width="100%" height={24} borderRadius="sm" isLoading />
      <Box height={0.5} mx="1" backgroundColor="ink.border-transparent" />
      <SkeletonLoader width="100%" height={24} borderRadius="sm" isLoading />
    </Box>
  );
}
