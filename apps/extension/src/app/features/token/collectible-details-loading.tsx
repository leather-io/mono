import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ArrowLeftIcon, SkeletonLoader } from '@leather.io/ui';

import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';

import { SectionCard } from './collectible-details.layout';

function LoadingRow() {
  return (
    <Flex justifyContent="space-between" gap="space.04" py="space.02">
      <SkeletonLoader isLoading height="14px" width="80px" />
      <SkeletonLoader isLoading height="14px" width="120px" />
    </Flex>
  );
}

interface CollectibleDetailsLoadingProps {
  onBack(): void;
}

export function CollectibleDetailsLoading({ onBack }: CollectibleDetailsLoadingProps) {
  return (
    <Stack width="100%" gap="space.04">
      <Header px={{ base: 'space.04', md: 'space.00' }}>
        <HeaderGrid
          leftCol={
            <HeaderActionButton
              icon={<ArrowLeftIcon />}
              onAction={onBack}
              dataTestId="collectible-details-back"
            />
          }
          centerCol={
            <Stack alignItems="center" gap="space.01">
              <SkeletonLoader isLoading height="20px" width="120px" />
              <SkeletonLoader isLoading height="14px" width="80px" />
            </Stack>
          }
          rightCol={<Box />}
        />
      </Header>

      <Stack
        px={{ base: 'space.04', md: 'space.00' }}
        width="100%"
        maxWidth={{ base: '100%', md: '780px' }}
        margin="0 auto"
        gap="space.04"
      >
        {/* Media placeholder */}
        <SectionCard>
          <SkeletonLoader isLoading height="320px" width="100%" borderRadius="sm" />
        </SectionCard>

        {/* Stats placeholder */}
        <Flex gap="space.03">
          <Box flex="1" bg="ink.background-primary" p="space.04" borderRadius="sm">
            <Stack gap="space.02">
              <SkeletonLoader isLoading height="12px" width="60px" />
              <SkeletonLoader isLoading height="18px" width="80px" />
            </Stack>
          </Box>
          <Box flex="1" bg="ink.background-primary" p="space.04" borderRadius="sm">
            <Stack gap="space.02">
              <SkeletonLoader isLoading height="12px" width="60px" />
              <SkeletonLoader isLoading height="18px" width="80px" />
            </Stack>
          </Box>
        </Flex>

        {/* Description placeholder */}
        <SectionCard title="Description">
          <Stack gap="space.02">
            <SkeletonLoader isLoading height="14px" width="100%" />
            <SkeletonLoader isLoading height="14px" width="90%" />
            <SkeletonLoader isLoading height="14px" width="70%" />
          </Stack>
        </SectionCard>

        {/* Collectible Info placeholder */}
        <SectionCard title="Collectible Info">
          <Stack gap="space.01">
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </Stack>
        </SectionCard>
      </Stack>
    </Stack>
  );
}
