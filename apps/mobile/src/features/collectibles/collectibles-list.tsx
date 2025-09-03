import { ReactElement } from 'react';

import { ErrorFallbackTab } from '@/components/error/error';
import { Loading } from '@/components/loading/loading';
import { Screen } from '@/components/screen/screen';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { Account } from '@/store/accounts/accounts';

import { EmptyCollectiblesState } from './empty-collectibles-state';
import { renderCollectible } from './render-collectible';

interface CollectiblesListProps {
  currentAccount: Account;
  header: ReactElement;
}

export function CollectiblesList({ currentAccount, header }: CollectiblesListProps) {
  const { fingerprint, accountIndex } = currentAccount;
  const data = useAccountCollectibles(fingerprint, accountIndex);

  return (
    <Screen.FlashList
      numColumns={2}
      data={data.value}
      renderItem={data.state === 'success' ? renderCollectible : undefined}
      getItemType={item => item.protocol}
      refreshControl={<RefreshControl />}
      ListHeaderComponent={
        <>
          {header}
          {/* TODO: ask design for loading state for collectibles */}
          {data.state === 'loading' && <Loading mode="widget" count={1} />}
          {data.state === 'error' && <ErrorFallbackTab />}
        </>
      }
      ListEmptyComponent={
        data.state !== 'loading' && data.state !== 'error' ? <EmptyCollectiblesState /> : undefined
      }
    />
  );
}
