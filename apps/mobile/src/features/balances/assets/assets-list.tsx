import { ReactElement, useMemo } from 'react';

import { Screen } from '@/components/screen/screen';
import { sortSip10Balances } from '@/features/balances/assets/utils/sort-sip10-balances';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { TokenDetailsProps } from '@/features/token/types';
import { useRunesAccountBalance } from '@/queries/balance/runes-balance.query';
import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';

import { RuneBalance, Sip10Balance } from '@leather.io/services';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { renderAsset } from './render-assets';

interface AssetsListProps {
  sip10Data: ReturnType<typeof useSip10AccountBalance>;
  runesData: ReturnType<typeof useRunesAccountBalance>;
  header: ReactElement;
  onPressToken?: (tokenDetails: TokenDetailsProps) => void;
}

export function AssetsList({ sip10Data, runesData, header, onPressToken }: AssetsListProps) {
  const sip10Memo = useMemo(() => {
    if (sip10Data.state === 'success') return sip10Data.value.sip10s.sort(sortSip10Balances);
    return [];
  }, [sip10Data]);

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
