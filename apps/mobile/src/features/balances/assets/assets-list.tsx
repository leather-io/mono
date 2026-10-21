import { ReactElement, useMemo } from 'react';

import { Screen } from '@/components/screen/screen';
import { useUsdcxBalance } from '@/features/balances/assets/use-usdcx-balance';
import { sortSip10Balances } from '@/features/balances/assets/utils/sort-sip10-balances';
import {
  type AssetsListItem,
  isUsdcxBridgeItem,
  shouldShowUsdcxBridge,
  withUsdcxBridge,
} from '@/features/balances/assets/utils/with-usdcx-bridge';
import { UsdcxBridgeTokenCell } from '@/features/balances/stacks/usdcx-bridge-token-cell';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
import { useRouter } from 'expo-router';

import { AccountId, CryptoAssetId } from '@leather.io/models';
import { useTheme } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { renderAsset } from './render-assets';

interface AssetsListProps {
  account: AccountId;
  sip10Data: ReturnType<typeof useSip10AccountBalance>;
  header: ReactElement;
  footer?: ReactElement;
}

export function AssetsList({ account, sip10Data, header, footer }: AssetsListProps) {
  const router = useRouter();
  const theme = useTheme();
  const usdcx = useUsdcxBalance(account);
  const sip10List = sip10Data.state === 'success' ? sip10Data.value.sip10s : undefined;
  const isUsdcxBalanceLoading = usdcx.balance.state === 'loading';
  const showUsdcxBridge = shouldShowUsdcxBridge({
    usdcxBalance: usdcx.balance.state === 'success' ? usdcx.balance.value : undefined,
    isMainnet: usdcx.isMainnet,
    isVisible: usdcx.isVisible,
  });

  const assetsMemo = useMemo<AssetsListItem[]>(() => {
    if (!sip10List || isUsdcxBalanceLoading) return [];
    return withUsdcxBridge([...sip10List].sort(sortSip10Balances), usdcx.assetId, showUsdcxBridge);
  }, [sip10List, isUsdcxBalanceLoading, usdcx.assetId, showUsdcxBridge]);

  function navigateToAsset(assetId: CryptoAssetId) {
    router.navigate({
      pathname: '/(tabs)/(index)/[assetId]',
      params: {
        assetId: serializeAssetId(assetId),
      },
    });
  }

  return (
    <Screen.FlashList<AssetsListItem>
      data={assetsMemo}
      renderItem={({ item }) => {
        if (isUsdcxBridgeItem(item)) {
          return (
            <UsdcxBridgeTokenCell
              assetId={item.assetId}
              onPress={() => navigateToAsset({ protocol: 'sip10', id: item.assetId })}
            />
          );
        }
        return renderAsset({ item, onPress: () => navigateToAsset(getAssetId(item.asset)) });
      }}
      getItemType={item => (isUsdcxBridgeItem(item) ? item.kind : item.asset.protocol)}
      // TODO: RefreshControl is working but isn't showing
      refreshControl={<RefreshControl />}
      ListFooterComponentStyle={{ paddingTop: theme.spacing['5'] }}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
    />
  );
}
