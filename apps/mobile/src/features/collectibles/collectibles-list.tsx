import { ReactElement } from 'react';

import { ErrorFallbackTab } from '@/components/error/error';
import { Loading } from '@/components/loading/loading';
import { Screen } from '@/components/screen/screen';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useAccountBnsNames } from '@/queries/bns/bns.query';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, NonFungibleCryptoAsset } from '@leather.io/models';

import { EmptyCollectiblesState } from './empty-collectibles-state';
import { renderCollectible } from './render-collectible';

interface CollectiblesListProps {
  currentAccount: AccountId;
  header: ReactElement;
}

export function CollectiblesList({ currentAccount, header }: CollectiblesListProps) {
  const { fingerprint, accountIndex } = currentAccount;
  const { value: collectibles, state: collectiblesState } = useAccountCollectibles(
    fingerprint,
    accountIndex
  );
  const { value: bnsNames, state: bnsNamesState } = useAccountBnsNames(fingerprint, accountIndex);
  const collectibleData: NonFungibleCryptoAsset[] = [
    ...(collectibles ?? []),
    ...(bnsNames?.map(bns => ({
      category: 'nft' as const,
      chain: 'stacks' as const,
      protocol: 'sip9' as const,
      collection: 'bns',
      name: bns.fullName,
      assetId: '',
      contractId: '',
      tokenId: 0,
      description: bns.namespace,
      cachedImage: '',
      cachedImageThumbnail: '',
    })) ?? []),
  ];

  const isSuccess = collectiblesState === 'success' && bnsNamesState === 'success';
  const isLoading = collectiblesState === 'loading' || bnsNamesState === 'loading';
  const isError = collectiblesState === 'error' || bnsNamesState === 'error';

  return (
    <Screen.FlashList
      numColumns={2}
      data={collectibleData}
      renderItem={isSuccess ? renderCollectible : undefined}
      getItemType={item => item.protocol}
      refreshControl={<RefreshControl />}
      ListHeaderComponent={
        <>
          {header}
          {/* TODO: LEA-3190 loading state for collectibles */}
          {isLoading && <Loading mode="widget" count={1} />}
          {isError && <ErrorFallbackTab />}
        </>
      }
      ListEmptyComponent={!isLoading && !isError ? <EmptyCollectiblesState /> : undefined}
    />
  );
}
