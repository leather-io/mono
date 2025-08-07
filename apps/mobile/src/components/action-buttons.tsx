import { useGlobalSheets } from '@/core/global-sheet-provider';
import { t } from '@lingui/core/macro';

import { Button } from '@leather.io/ui/native';

interface ActionButtonsProps {
  canSend?: boolean;
}

export function ActionButtons({ canSend = true }: ActionButtonsProps) {
  const { sendSheetRef, receiveSheetRef } = useGlobalSheets();
  return (
    <>
      <Button
        onPress={() => sendSheetRef.current?.present()}
        disabled={!canSend}
        minWidth={86}
        size="md"
      >
        {t`Send`}
      </Button>

      <Button
        onPress={() => receiveSheetRef.current?.present()}
        minWidth={86}
        size="md"
        variant="outline"
      >
        {t`Receive`}
      </Button>
    </>
  );
}
