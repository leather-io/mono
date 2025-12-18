import { Box, type BoxProps } from 'leather-styles/jsx';

import { ItemLayout, SkeletonLoader } from '@leather.io/ui';

export function CryptoAssetItemPlaceholder({ ...props }: BoxProps) {
  return (
    <Box my="space.02" {...props}>
      <ItemLayout
        img={<SkeletonLoader isLoading width="48px" height="48px" borderRadius="round" />}
        titleLeft={<SkeletonLoader isLoading height="20px" width="126px" />}
        captionLeft={<SkeletonLoader isLoading height="20px" width="78px" />}
        titleRight={<SkeletonLoader isLoading width="126px" />}
        captionRight={<SkeletonLoader isLoading width="78px" />}
      />
    </Box>
  );
}
