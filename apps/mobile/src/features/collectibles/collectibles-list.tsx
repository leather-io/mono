import { ReactElement } from 'react';

import { ErrorFallbackTab } from '@/components/error/error';
import { Loading } from '@/components/loading/loading';
import { Screen } from '@/components/screen/screen';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useAccountBnsNames } from '@/queries/bns/bns.query';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { Account } from '@/store/accounts/accounts';

import { CryptoAssetProtocols, NonFungibleCryptoAsset } from '@leather.io/models';

import { EmptyCollectiblesState } from './empty-collectibles-state';
import { renderCollectible } from './render-collectible';

interface CollectiblesListProps {
  currentAccount: Account;
  header: ReactElement;
}

export function CollectiblesList({ currentAccount, header }: CollectiblesListProps) {
  const { fingerprint, accountIndex } = currentAccount;
  const data = useAccountCollectibles(fingerprint, accountIndex);
  const { value: bnsNames } = useAccountBnsNames(fingerprint, accountIndex);
  console.log('bnsNames', bnsNames);
  const collectibleData: NonFungibleCryptoAsset[] = [
    ...(data?.value ?? []),
    ...(bnsNames?.map(
      bns =>
        ({
          ...bns,
          protocol: CryptoAssetProtocols.sip9,
          category: 'nft',
          chain: 'stacks',
          assetId: bns.name,
          contractId: bns.name,
          tokenId: Number(bns.name),
          cachedImage: '',
          cachedImageThumbnail: '',
          description: `BNS name: ${bns.fullName}`,
          name: bns.fullName,
          collection: 'bns',
          type: 'sip9',
          // category: 'nft',
          // assetId: bns.name,
          // contractId: bns.name,
          // tokenId: Number(bns.name),
          // cachedImage: '',
          // cachedImageThumbnail: '',
          // description: `BNS name: ${bns.fullName}`,
        }) as NonFungibleCryptoAsset
    ) ?? []),
  ];
  return (
    <Screen.FlashList
      numColumns={2}
      data={collectibleData}
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
