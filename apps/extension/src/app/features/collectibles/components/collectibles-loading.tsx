import { Box, Stack, styled } from 'leather-styles/jsx';

import { SkeletonLoader } from '@leather.io/ui';

const CARD_SIZE = 195;

function CollectibleCardSkeleton({ index }: { index: number }) {
  return (
    <Box width={`${CARD_SIZE}px`} height={`${CARD_SIZE}px`} p="space.02">
      <SkeletonLoader
        isLoading
        width="100%"
        height="100%"
        borderRadius="sm"
        style={{ animationDelay: `${index * 100}ms` }}
      />
    </Box>
  );
}

export function CollectiblesLoading() {
  return (
    <Stack gap="space.04">
      <Box
        // Full-bleed grid on small widths (HomeTabs adds 24px padding)
        width={{ base: 'calc(100% + 48px)', md: '100%' }}
        marginX={{ base: '-24px', md: 0 }}
      >
        <styled.div
          display="grid"
          gridTemplateColumns={{ base: 'repeat(2, 195px)', md: 'repeat(4, 195px)' }}
          justifyContent="center"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <CollectibleCardSkeleton key={i} index={i} />
          ))}
        </styled.div>
      </Box>
    </Stack>
  );
}
