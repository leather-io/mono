import { ReactElement, useMemo } from 'react';

import { Screen } from '@/components/screen/screen';
import { useUsdcxBalance } from '@/features/balances/assets/use-usdcx-balance';
import { sortSip10Balances } from '@/features/balances/assets/utils/sort-sip10-balances';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
import { useRouter } from 'expo-router';

import { AccountId } from '@leather.io/models';
import { Sip10Balance } from '@leather.io/services';
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
  const {
    assetId: usdcxAssetId,
    balance: usdcxFetchState,
    isVisible: isUsdcxVisible,
  } = useUsdcxBalance(account);

  const sip10Memo = useMemo(() => {
    const usdcxBalance =
      isUsdcxVisible && usdcxFetchState.state === 'success' ? usdcxFetchState.value : undefined;

    if (sip10Data.state !== 'success') {
      return usdcxBalance ? [usdcxBalance] : [];
    }

    const sip10s = [...sip10Data.value.sip10s];
    const hasUsdcxInSip10s = sip10s.some(sip10 => sip10.asset.assetId === usdcxAssetId);

    if (!hasUsdcxInSip10s && usdcxBalance) {
      sip10s.push(usdcxBalance);
    }

    return sip10s.sort(sortSip10Balances);
  }, [sip10Data, usdcxAssetId, usdcxFetchState, isUsdcxVisible]);

  const allAssetsMemo = [...sip10Memo];

  return (
    <Screen.FlashList<Sip10Balance>
      data={allAssetsMemo}
      renderItem={({ item }) =>
        renderAsset({
          item,
          onPress: () =>
            router.navigate({
              pathname: '/(tabs)/(index)/[assetId]',
              params: {
                assetId: serializeAssetId(getAssetId(item.asset)),
              },
            }),
        })
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
