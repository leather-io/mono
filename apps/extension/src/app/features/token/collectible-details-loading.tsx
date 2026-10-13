import { Box, Flex, Stack } from 'leather-styles/jsx';

import { ArrowLeftIcon, SkeletonLoader } from '@leather.io/ui';

import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';

import { SectionCard } from './collectible-details.layout';

const maxImageSize = 280;

function LoadingRow() {
  return (
    <Flex justifyContent="space-between" gap="space.04" py="space.02">
      <SkeletonLoader isLoading height="14px" width="80px" />
      <SkeletonLoader isLoading height="14px" width="120px" />
    </Flex>
  );
}

function LoadingTitleSkeleton() {
  return (
    <Stack alignItems="center" gap="space.01">
      <SkeletonLoader isLoading height="20px" width="120px" />
      <SkeletonLoader isLoading height="14px" width="80px" />
    </Stack>
  );
}

interface LoadingHeaderProps {
  onBack(): void;
}

function LoadingHeader({ onBack }: LoadingHeaderProps) {
  return (
    <Header px={{ base: 'space.04', md: 'space.00' }}>
      <HeaderGrid
        leftCol={
          <HeaderActionButton
            icon={<ArrowLeftIcon />}
            onAction={onBack}
            dataTestId="collectible-details-back"
          />
        }
        centerCol={<LoadingTitleSkeleton />}
        rightCol={<Box />}
      />
    </Header>
  );
}

interface CollectibleDetailsLoadingProps {
  onBack(): void;
}

export function CollectibleDetailsLoading({ onBack }: CollectibleDetailsLoadingProps) {
  return (
    <Stack width="100%" gap="space.04">
      <LoadingHeader onBack={onBack} />

      <Stack
        px={{ base: 'space.04', md: 'space.00' }}
        width="100%"
        maxWidth={{ base: '100%', md: '780px' }}
        margin="0 auto"
        gap="space.05"
      >
        <Stack gap="space.04" alignItems="center">
          <Box width="100%" maxWidth={`${maxImageSize}px`}>
            <SkeletonLoader isLoading height={`${maxImageSize}px`} width="100%" borderRadius="sm" />
          </Box>
          <Flex gap="space.03" justifyContent="center">
            <SkeletonLoader isLoading height="40px" width="100px" borderRadius="sm" />
            <SkeletonLoader isLoading height="40px" width="100px" borderRadius="sm" />
          </Flex>
        </Stack>

        <SectionCard title="Description">
          <Stack gap="space.02">
            <SkeletonLoader isLoading height="14px" width="100%" />
            <SkeletonLoader isLoading height="14px" width="90%" />
            <SkeletonLoader isLoading height="14px" width="70%" />
          </Stack>
        </SectionCard>

        <SectionCard title="Details">
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
