import { SkeletonLoader } from '@leather.io/ui/native';

interface LoadingProps {
  count: number;
  height: number;
}
export function Loading({ count, height }: LoadingProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLoader height={height} width="100%" isLoading={true} key={`loading-${index}`} />
      ))}
    </>
  );
}
