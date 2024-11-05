import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { NetworkBadge } from '@/components/network-badge';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { RouteProp, useRoute } from '@react-navigation/native';

import { Text } from '@leather.io/ui/native';

import { SendSheetNavigatorParamList } from '../send-sheet-navigator';

type SendFormRouteProp = RouteProp<SendSheetNavigatorParamList, 'send-form'>;

export function SendForm() {
  const { i18n } = useLingui();
  const route = useRoute<SendFormRouteProp>();

  const accountName = route.params.account.name;
  const asset = route.params.asset;

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t({
            id: 'send_form.header_title',
            message: 'Send',
          })}
          subtitle={i18n._({
            id: 'select_asset.header_subtitle',
            message: '{subtitle}',
            values: { subtitle: accountName },
          })}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <Text>{t`Send form ${asset}`}</Text>
    </FullHeightSheetLayout>
  );
}
