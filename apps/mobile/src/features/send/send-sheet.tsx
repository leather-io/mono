import { RefObject } from 'react';

import { FullHeightSheetHeader } from '@/components/headers/full-height-sheet-header';
import { NetworkBadge } from '@/components/network-badge';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet.layout';
import { t } from '@lingui/macro';

import { SheetRef } from '@leather.io/ui/native';

interface SendSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function SendSheet({ sheetRef }: SendSheetProps) {
  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t`Placeholder`}
          subtitle={t`Placeholder`}
          rightElement={<NetworkBadge />}
        />
      }
      sheetRef={sheetRef}
    >
      <></>
    </FullHeightSheetLayout>
  );
}
