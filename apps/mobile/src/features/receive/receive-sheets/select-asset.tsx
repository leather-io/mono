import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { NetworkBadge } from '@/components/network-badge';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { RouteProp, useRoute } from '@react-navigation/native';

import { Text } from '@leather.io/ui/native';

import { ReceiveSheetNavigatorParamList } from '../receive-sheet-navigator';

type SelectAssetScreenRouteProp = RouteProp<ReceiveSheetNavigatorParamList, 'receive-select-asset'>;

export function SelectAsset() {
  const { i18n } = useLingui();
  const route = useRoute<SelectAssetScreenRouteProp>();
  const subtitle = route.params?.account?.name;

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t({
            id: 'select_asset.header_title',
            message: 'Select asset',
          })}
          subtitle={i18n._({
            id: 'select_asset.header_subtitle',
            message: '{subtitle}',
            values: { subtitle },
          })}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <Text>{t`Token list`}</Text>
    </FullHeightSheetLayout>
  );
}
