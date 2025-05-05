import { Box, BoxProps } from 'leather-styles/jsx';

import { shimmerStyles } from './shimmer.styles.web';

interface SkeletonLoaderProps extends Omit<BoxProps, 'className' | 'bgColor'> {
  isLoading: boolean;
  children?: React.ReactNode;
}

export function SkeletonLoader({ children, isLoading, ...boxProps }: SkeletonLoaderProps) {
  if (isLoading) {
    return (
      <Box
        width="30px"
        height="30px"
        borderRadius="sm"
        className={shimmerStyles}
        bgColor="ink.text-non-interactive"
        data-state="loading"
        {...boxProps}
      />
    );
  }

  return <>{children}</>;
}
