import { LoadingItem } from './loading-item';
import { LoadingWidget } from './loading-widget';

interface LoadingProps {
  view?: 'widget' | 'full';
  count?: number;
}
export function Loading({ view = 'full', count = 1 }: LoadingProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) =>
        view === 'widget' ? (
          <LoadingWidget key={`loading-widget-${index}`} />
        ) : (
          <LoadingItem key={`loading-item-${index}`} />
        )
      )}
    </>
  );
}
