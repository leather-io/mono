import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { NetworkBadge } from '@/components/network-badge';
import { t } from '@lingui/macro';

import { Text } from '@leather.io/ui/native';

export function SendForm() {
  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t({
            id: 'send_form.header_title',
            message: 'Send',
          })}
          subtitle={t`Placeholder`}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <Text>{t`Send form`}</Text>
    </FullHeightSheetLayout>
  );
}
