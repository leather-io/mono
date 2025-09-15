import { ReactElement } from 'react';

import { ErrorFallbackTab } from '@/components/error/error';
import { Loading } from '@/components/loading/loading';
import { Screen } from '@/components/screen/screen';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { TokenDetailsProps } from '@/features/token/types';
import { useAccountBnsNames } from '@/queries/bns/bns.query';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, NonFungibleCryptoAsset } from '@leather.io/models';

import { EmptyCollectiblesState } from './empty-collectibles-state';
import { renderCollectible } from './render-collectible';

interface CollectiblesListProps {
  currentAccount: AccountId;
  header: ReactElement;
  onPressToken?: (tokenDetails: TokenDetailsProps) => void;
}

/* PETE: what to do :
//
// 1. scaffold simple collectibles details with existing data
// 2. investigate improving service to 
// => return bns names with sip9 properly 
// => ordinal text / html 
// => stamps + gamma api 
*/

export function CollectiblesList({ currentAccount, header, onPressToken }: CollectiblesListProps) {
  const { fingerprint, accountIndex } = currentAccount;
  const { value: collectibles, state: collectiblesState } = useAccountCollectibles(
    fingerprint,
    accountIndex
  );
  // const { value: bnsNames, state: bnsNamesState } = useAccountBnsNames(fingerprint, accountIndex);
  console.log('collectibles', collectibles);
  // console.log('bnsNames', bnsNames);
  // const collectibleData: NonFungibleCryptoAsset[] = [
  //   ...(collectibles ?? []),
  //   ...(bnsNames?.map(bns => ({
  //     category: 'nft' as const,
  //     chain: 'stacks' as const,
  //     protocol: 'sip9' as const,
  //     collection: 'bns',
  //     name: bns.fullName,
  //     assetId: '',
  //     contractId: '',
  //     tokenId: 0,
  //     description: bns.namespace,
  //     cachedImage: '',
  //     cachedImageThumbnail: '',
  //     contentType: '',
  //   })) ?? []),
  // ];

  const isSuccess = collectiblesState === 'success'; //&& bnsNamesState === 'success';
  const isLoading = collectiblesState === 'loading'; //|| bnsNamesState === 'loading';
  const isError = collectiblesState === 'error'; //|| bnsNamesState === 'error';

  return (
    <Screen.FlashList
      numColumns={2}
      data={collectibles}
      renderItem={
        isSuccess
          ? ({ item }) =>
              renderCollectible({
                item,
                onPress: onPressToken
                  ? () => {
                      if (item.protocol === 'sip9')
                        onPressToken?.({
                          assetId: item.assetId,
                          assetProtocol: item.protocol,
                        });
                      if (item.protocol === 'inscription')
                        onPressToken?.({
                          assetId: item.id,
                          assetProtocol: item.protocol,
                        });
                      if (item.protocol === 'stamp')
                        onPressToken?.({
                          assetId: item.stamp.toString(),
                          assetProtocol: item.protocol,
                        });
                    }
                  : undefined,
              })
          : undefined
      }
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
