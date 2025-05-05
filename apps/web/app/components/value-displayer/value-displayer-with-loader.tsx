import { ReactNode } from 'react';

import { SkeletonLoader } from '@leather.io/ui';

import { ValueDisplayerProps } from './default-value-displayer';
import { ValueDisplayerBase } from './reward-value-displayer';

interface ValueDisplayerWithLoaderProps extends ValueDisplayerProps {
  isLoading: boolean;
}
export function ValueDisplayerWithLoader({
  name,
  value,
  isLoading,
}: ValueDisplayerWithLoaderProps) {
  return (
    <ValueDisplayerBase>
      <ValueDisplayerBase.Name name={name} />
      <SkeletonLoader height="15" width="80" isLoading={isLoading}>
        <ValueDisplayerBase.Value value={value} />
      </SkeletonLoader>
    </ValueDisplayerBase>
  );
}

interface ValueDisplayerWithCustomLoaderProps extends ValueDisplayerProps {
  isLoading: boolean;
  customSkeletonLayout: ReactNode;
}
export function ValueDisplayerWithCustomLoader({
  value,
  isLoading,
  customSkeletonLayout,
  name,
}: ValueDisplayerWithCustomLoaderProps) {
  return (
    <ValueDisplayerBase>
      <ValueDisplayerBase.Name name={name} />
      {isLoading ? customSkeletonLayout : <ValueDisplayerBase.Value value={value} />}
    </ValueDisplayerBase>
  );
}
