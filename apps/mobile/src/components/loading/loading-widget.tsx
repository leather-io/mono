import { Box, Pressable, SkeletonLoader } from '@leather.io/ui/native';

export function LoadingWidget() {
  return (
    <Pressable
      width={200}
      height={156}
      p="4"
      bg="ink.background-primary"
      borderWidth={1}
      borderStyle="solid"
      borderColor="ink.border-transparent"
      borderRadius="sm"
    >
      <Box flexDirection="column" justifyContent="space-between" gap="4">
        <Box alignItems="center" height={48} width={48}>
          <SkeletonLoader borderRadius="round" height={48} width={48} isLoading={true} />
        </Box>
        <Box mt="6" flexDirection="row" justifyContent="space-between" width={80}>
          <SkeletonLoader height={24} width={80} isLoading={true} />
        </Box>
      </Box>
    </Pressable>
  );
}
