import { ReactElement } from 'react';

import { Screen } from '@/components/screen/screen';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useTotalCollectibles } from '@/queries/collectibles/account-collectibles.query';

import { EmptyCollectiblesState } from './empty-collectibles-state';
import { renderCollectible } from './render-collectible';

interface CollectiblesListProps {
  collectiblesData: ReturnType<typeof useTotalCollectibles>;
  header: ReactElement;
}

export function CollectiblesList({ collectiblesData, header }: CollectiblesListProps) {
  const collectibles = collectiblesData.state === 'success' ? collectiblesData.value : [];

  return (
    <Screen.FlashList
      numColumns={2}
      data={collectibles}
      renderItem={renderCollectible}
      getItemType={item => {
        return item.protocol;
      }}
      refreshControl={<RefreshControl />}
      ListHeaderComponent={header}
      ListEmptyComponent={<EmptyCollectiblesState />}
    />
  );
}
