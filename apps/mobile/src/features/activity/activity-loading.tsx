import { ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';

import { LoadingItem } from '@/components/loading/loading-item';
import { Screen } from '@/components/screen/screen';

interface ActivityLoadingProps {
  header?: ReactNode;
  count?: number;
}

const estimatedRowHeight = 72;

export function ActivityLoading({ header, count }: ActivityLoadingProps) {
  const { height } = useWindowDimensions();
  const resolvedCount = count ?? Math.ceil(height / estimatedRowHeight) + 2;
  const skeletonRows = Array.from({ length: resolvedCount }, (_, index) => index);
  return (
    <Screen.List
      data={skeletonRows}
      keyExtractor={index => `activity-skeleton-${index}`}
      renderItem={() => <LoadingItem />}
      ListHeaderComponent={header ? <>{header}</> : null}
    />
  );
}
