import { FullHeightSheetHeader } from '@/components/headers/full-height-sheet-header';
import { NetworkBadge } from '@/components/network-badge';
import { t } from '@lingui/macro';

import { Text } from '@leather.io/ui/native';

import { SendSheetLayout } from '../send-sheet.layout';

export function SendForm() {
  return (
    <SendSheetLayout
      header={
        <FullHeightSheetHeader
          title={t`Send`}
          subtitle={t`Placeholder`}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <Text>{t`Send form`}</Text>
    </SendSheetLayout>
  );
}
