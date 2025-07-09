import { Box, SkeletonLoader, Text } from '@leather.io/ui/native';

export interface TokenOverviewProps {
  heading: React.ReactNode;
  isLoading: boolean;
  availableBalance: React.ReactNode;
  quoteBalance: React.ReactNode;
}

export function TokenOverview({
  heading,
  isLoading,
  availableBalance,
  quoteBalance,
}: TokenOverviewProps) {
  if (isLoading) {
    return (
      <Box alignItems="center" alignContent="center" alignSelf="stretch" flexWrap="wrap">
        <Box mx="5" pt="4" pb="8" flexDirection="column" alignItems="center" gap="4" flex={1}>
          <Box flexDirection="row" height={64} width={64} borderRadius="round" overflow="hidden">
            <SkeletonLoader height={64} width={64} isLoading={true} />
          </Box>
          <SkeletonLoader height={44} width={132} isLoading={true} />
        </Box>
      </Box>
    );
  }
  return (
    <Box alignItems="center" alignContent="center" alignSelf="stretch" flexWrap="wrap">
      <Box mx="5" pt="4" pb="8" flexDirection="column" alignItems="center" gap="3" flex={1}>
        {heading}
        <Box gap="1" flexDirection="column" alignItems="center">
          <Text variant="label01" textAlign="center">
            {availableBalance}
          </Text>
          <Text variant="caption01" textAlign="center">
            {quoteBalance}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
