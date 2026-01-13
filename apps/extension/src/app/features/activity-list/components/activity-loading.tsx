import { Box, Circle, Flex, Stack } from 'leather-styles/jsx';

import { ItemLayout, SkeletonLoader } from '@leather.io/ui';

function ActivityItemSkeleton({ index }: { index: number }) {
  return (
    <Box px="space.05" py="space.03" style={{ animationDelay: `${index * 100}ms` }}>
      <ItemLayout
        img={<Circle bgColor="ink.component-background-default" size="36px" />}
        titleLeft={<SkeletonLoader isLoading height="16px" width="120px" />}
        captionLeft={<SkeletonLoader isLoading height="14px" width="80px" />}
        titleRight={<SkeletonLoader isLoading height="16px" width="80px" />}
        captionRight={<SkeletonLoader isLoading height="14px" width="60px" />}
      />
    </Box>
  );
}

export function ActivityLoading() {
  return (
    <Stack flexGrow={1} position="relative">
      <Flex flexDirection="column" flexGrow={1}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ActivityItemSkeleton key={i} index={i} />
        ))}
      </Flex>
    </Stack>
  );
}
