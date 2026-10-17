import { ReactElement, useMemo } from 'react';

import { Screen } from '@/components/screen/screen';
import { sortSip10Balances } from '@/features/balances/assets/utils/sort-sip10-balances';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
import { useRouter } from 'expo-router';

import { type CryptoAssetId } from '@leather.io/models';
import { type Sip10Balance } from '@leather.io/services';
import { useTheme } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { renderAsset } from './render-assets';

interface AssetsListProps {
  sip10Data: ReturnType<typeof useSip10AccountBalance>;
  header: ReactElement;
  footer?: ReactElement;
}

export function AssetsList({ sip10Data, header, footer }: AssetsListProps) {
  const router = useRouter();
  const theme = useTheme();
  const sip10List = sip10Data.state === 'success' ? sip10Data.value.sip10s : undefined;

  const assetsMemo = useMemo(
    () => (sip10List ? [...sip10List].sort(sortSip10Balances) : []),
    [sip10List]
  );

  function navigateToAsset(assetId: CryptoAssetId) {
    router.navigate({
      pathname: '/(tabs)/(index)/[assetId]',
      params: {
        assetId: serializeAssetId(assetId),
      },
    });
  }

  return (
    <Screen.FlashList<Sip10Balance>
      data={assetsMemo}
      renderItem={({ item }) =>
        renderAsset({ item, onPress: () => navigateToAsset(getAssetId(item.asset)) })
      }
      getItemType={item => item.asset.protocol}
      // TODO: RefreshControl is working but isn't showing
      refreshControl={<RefreshControl />}
      ListFooterComponentStyle={{ paddingTop: theme.spacing['5'] }}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
    />
  );
}
