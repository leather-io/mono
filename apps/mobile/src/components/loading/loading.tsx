import { ViewMode } from '@/shared/types';

import { LoadingItem } from './loading-item';
import { LoadingWidget } from './loading-widget';

interface LoadingProps {
  mode?: ViewMode;
  count?: number;
}
export function Loading({ mode = 'full', count = 1 }: LoadingProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) =>
        mode === 'widget' ? (
          <LoadingWidget key={`loading-widget-${index}`} />
        ) : (
          <LoadingItem key={`loading-item-${index}`} />
        )
      )}
    </>
  );
}
