import { ReactElement } from 'react';
import { useWindowDimensions } from 'react-native';

import { ErrorFallbackTab } from '@/components/error/error';
import { Screen } from '@/components/screen/screen';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { EmptyCollectiblesState } from '@/features/token/components/empty-collectibles-state';
import { Loading } from '@/features/token/components/loading';
import { TokenDetailsProps } from '@/features/token/types';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, NonFungibleCryptoAsset } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { Inscription } from './components/inscription';
import { Sip9 } from './stacks/sip9';
import { Stamp } from './bitcoin/stamp';

interface RenderCollectibleProps {
  item: NonFungibleCryptoAsset;
  height: number;
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}
function renderCollectible({ item, height, onPress }: RenderCollectibleProps) {
  switch (item.protocol) {
    case 'stamp':
      return <Stamp item={item} height={height} onPress={onPress} />;
    case 'sip9':
      return <Sip9 item={item} height={height} onPress={onPress} />;
    case 'inscription':
      return <Inscription item={item} height={height} onPress={onPress} />;
    default:
      return assertUnreachable(item);
  }
}

function useCollectibleListItemHeight() {
  const { height } = useWindowDimensions();
  // Set height to 25% of screen, but clamp between 160 and 200
  // Going above 200px leaves visible gaps between some images
  const calculatedHeight = Math.round(Math.max(160, Math.min(height * 0.25, 200)));

  return calculatedHeight;
}

interface CollectiblesListProps {
  currentAccount: AccountId;
  header: ReactElement;
  onPressToken?: (tokenDetails: TokenDetailsProps) => void;
}

export function CollectiblesList({ currentAccount, header, onPressToken }: CollectiblesListProps) {
  const { fingerprint, accountIndex } = currentAccount;
  const { value: collectibles, state: collectiblesState } = useAccountCollectibles(
    fingerprint,
    accountIndex
  );
  const height = useCollectibleListItemHeight();

  const isSuccess = collectiblesState === 'success';
  const isLoading = collectiblesState === 'loading';
  const isError = collectiblesState === 'error';

  return (
    <Screen.FlashList
      numColumns={2}
      data={collectibles}
      renderItem={
        isSuccess
          ? ({ item }) =>
              renderCollectible({
                item,
                height,
                onPress: onPressToken ? onPressToken : undefined,
              })
          : undefined
      }
      getItemType={item => item.protocol}
      refreshControl={<RefreshControl />}
      ListHeaderComponent={
        <>
          {header}
          {isLoading && <Loading count={4} height={height} />}
          {isError && <ErrorFallbackTab />}
        </>
      }
      ListEmptyComponent={!isLoading && !isError ? <EmptyCollectiblesState /> : undefined}
    />
  );
}
