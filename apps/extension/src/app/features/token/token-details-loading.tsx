import { Box, Circle, Flex, Stack } from 'leather-styles/jsx';

import { SkeletonLoader } from '@leather.io/ui';

import { TokenDetailsHeader, TokenDetailsSection } from './token-details-screen.layout';

function LoadingRow() {
  return (
    <Flex
      px="space.05"
      py="space.01"
      alignItems="center"
      justifyContent="space-between"
      minHeight="30px"
    >
      <SkeletonLoader isLoading height="14px" width="80px" />
      <SkeletonLoader isLoading height="14px" width="100px" />
    </Flex>
  );
}

function LoadingHero() {
  return (
    <Stack
      bg="ink.background-primary"
      alignItems="center"
      justifyContent="center"
      p="space.05"
      gap="space.03"
    >
      <Circle bgColor="ink.component-background-default" size="64px" />
      <Stack gap="space.02" alignItems="center">
        <SkeletonLoader isLoading height="32px" width="160px" />
        <SkeletonLoader isLoading height="20px" width="100px" />
      </Stack>
      <Flex gap="space.02" pt="space.02">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonLoader key={i} isLoading height="36px" width="78px" borderRadius="999px" />
        ))}
      </Flex>
    </Stack>
  );
}

function LoadingDescription() {
  return (
    <Box px="space.05" pb="space.03">
      <Stack gap="space.02">
        <SkeletonLoader isLoading height="14px" width="100%" />
        <SkeletonLoader isLoading height="14px" width="90%" />
        <SkeletonLoader isLoading height="14px" width="70%" />
      </Stack>
    </Box>
  );
}

function LoadingActivity() {
  return (
    <Stack>
      {Array.from({ length: 3 }).map((_, i) => (
        <Flex
          key={i}
          px="space.05"
          py="space.03"
          bg="ink.background-primary"
          gap="space.03"
          alignItems="center"
        >
          <Circle bgColor="ink.component-background-default" size="36px" />
          <Stack gap="space.01" flex="1">
            <SkeletonLoader isLoading height="16px" width="120px" />
            <SkeletonLoader isLoading height="12px" width="80px" />
          </Stack>
          <Stack gap="space.01" alignItems="flex-end">
            <SkeletonLoader isLoading height="16px" width="80px" />
            <SkeletonLoader isLoading height="12px" width="60px" />
          </Stack>
        </Flex>
      ))}
    </Stack>
  );
}

export function TokenDetailsLoading({ title = 'Loading...' }: { title?: string }) {
  return (
    <Stack width="100%" gap="space.00">
      <TokenDetailsHeader title={title} />
      <Box width="100%" maxWidth={{ base: '100%', md: '780px' }} margin="0 auto">
        <Stack
          bg="ink.background-secondary"
          borderRadius={{ base: '0', md: 'md' }}
          overflow="hidden"
        >
          <LoadingHero />

          <TokenDetailsSection title="Description">
            <LoadingDescription />
          </TokenDetailsSection>

          <TokenDetailsSection title="Token details">
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </TokenDetailsSection>

          <TokenDetailsSection title="Activity">
            <LoadingActivity />
          </TokenDetailsSection>
        </Stack>
      </Box>
    </Stack>
  );
}
