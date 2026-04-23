import { ReactElement, useMemo } from 'react';

import { Screen } from '@/components/screen/screen';
import { sortSip10Balances } from '@/features/balances/assets/utils/sort-sip10-balances';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import {
  useSip10AccountBalance,
  useSip10BalanceByAssetId,
} from '@/queries/balance/sip10-balance.query';
import { useSettings } from '@/store/settings/settings';
import { useRouter } from 'expo-router';

import { USDCX_ASSET_ID_MAINNET, USDCX_ASSET_ID_TESTNET } from '@leather.io/constants';
import { AccountId } from '@leather.io/models';
import { Sip10Balance } from '@leather.io/services';
import { useTheme } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { renderAsset } from './render-assets';

function isUsdcxAssetId(assetId: string) {
  return assetId === USDCX_ASSET_ID_MAINNET || assetId === USDCX_ASSET_ID_TESTNET;
}

interface AssetsListProps {
  account: AccountId;
  sip10Data: ReturnType<typeof useSip10AccountBalance>;
  header: ReactElement;
  footer?: ReactElement;
}

export function AssetsList({ account, sip10Data, header, footer }: AssetsListProps) {
  const { fingerprint, accountIndex } = account;
  const { networkPreference } = useSettings();
  const router = useRouter();
  const theme = useTheme();

  const usdcxAssetId =
    networkPreference.chain.bitcoin.mode === 'mainnet'
      ? USDCX_ASSET_ID_MAINNET
      : USDCX_ASSET_ID_TESTNET;

  const usdcxBalance = useSip10BalanceByAssetId(fingerprint, accountIndex, usdcxAssetId);

  const sip10Memo = useMemo(() => {
    const hasUsdcxBalance = usdcxBalance.state === 'success' && usdcxBalance.value;

    if (sip10Data.state !== 'success') {
      return hasUsdcxBalance ? [usdcxBalance.value] : [];
    }

    const sip10s = [...sip10Data.value.sip10s];
    const hasUsdcxInSip10s = sip10s.some(sip10 => isUsdcxAssetId(sip10.asset.assetId));

    if (!hasUsdcxInSip10s && hasUsdcxBalance) {
      sip10s.push(usdcxBalance.value);
    }

    return sip10s.sort(sortSip10Balances);
  }, [sip10Data, usdcxBalance]);

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
