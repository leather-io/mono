import { ReactElement, useMemo } from 'react';

import { Screen } from '@/components/screen/screen';
import { sortSip10Balances } from '@/features/balances/assets/utils/sort-sip10-balances';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useRunesAccountBalance } from '@/queries/balance/runes-balance.query';
import {
  useSip10AccountBalance,
  useSip10BalanceByAssetId,
} from '@/queries/balance/sip10-balance.query';
import { useSettings } from '@/store/settings/settings';

import { USDCX_ASSET_ID_MAINNET, USDCX_ASSET_ID_TESTNET } from '@leather.io/constants';
import { TokenDetailsProps } from '@leather.io/features';
import { AccountId } from '@leather.io/models';
import { RuneBalance, Sip10Balance } from '@leather.io/services';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { renderAsset } from './render-assets';

function isUsdcxAssetId(assetId: string) {
  return assetId === USDCX_ASSET_ID_MAINNET || assetId === USDCX_ASSET_ID_TESTNET;
}

interface AssetsListProps {
  account: AccountId;
  sip10Data: ReturnType<typeof useSip10AccountBalance>;
  runesData: ReturnType<typeof useRunesAccountBalance>;
  header: ReactElement;
  onPressToken?(tokenDetails: TokenDetailsProps): void;
}

export function AssetsList({
  account,
  sip10Data,
  runesData,
  header,
  onPressToken,
}: AssetsListProps) {
  const { fingerprint, accountIndex } = account;
  const { networkPreference } = useSettings();

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

  const runes = runesData.state === 'success' ? runesData.value?.runes : [];

  const allAssetsMemo = [...sip10Memo, ...runes];

  return (
    <Screen.FlashList<Sip10Balance | RuneBalance>
      data={allAssetsMemo}
      renderItem={({ item }) =>
        renderAsset({
          item,
          onPress: onPressToken
            ? () =>
                onPressToken?.({
                  assetId: serializeAssetId(getAssetId(item.asset)),
                })
            : undefined,
        })
      }
      getItemType={item => item.asset.protocol}
      // TODO: RefreshControl is working but isn't showing
      refreshControl={<RefreshControl />}
      ListHeaderComponent={header}
    />
  );
}
