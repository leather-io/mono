import { FullHeightSheetHeader } from '@/components/headers/full-height-sheet-header';
import { NetworkBadge } from '@/components/network-badge';
import { t } from '@lingui/macro';
import { RouteProp, useRoute } from '@react-navigation/native';

import { Text } from '@leather.io/ui/native';

import { SendSheetNavigatorParamList } from '../send-sheet-navigator';
import { SendSheetLayout } from '../send-sheet.layout';

type SelectAssetScreenRouteProp = RouteProp<SendSheetNavigatorParamList, 'send-select-asset'>;

export function SelectAsset() {
  const route = useRoute<SelectAssetScreenRouteProp>();
  const subtitle = route.params?.account?.name;

  return (
    <SendSheetLayout
      header={
        <FullHeightSheetHeader
          title={t`Select asset`}
          subtitle={subtitle}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <Text>{t`Token list`}</Text>
    </SendSheetLayout>
  );
}
