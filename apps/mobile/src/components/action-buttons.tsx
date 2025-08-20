import { t } from '@lingui/core/macro';

import { Button } from '@leather.io/ui/native';

interface ActionButtonsProps {
  canSend?: boolean;
  fullWidth?: boolean;
  onSend(): void;
  onReceive(): void;
}

export function ActionButtons({
  canSend = true,
  fullWidth = false,
  onSend,
  onReceive,
}: ActionButtonsProps) {
  return (
    <>
      <Button onPress={onSend} disabled={!canSend} minWidth={86} size="md" flex={fullWidth ? 1 : 0}>
        {t`Send`}
      </Button>

      <Button
        onPress={onReceive}
        minWidth={86}
        size="md"
        variant="outline"
        flex={fullWidth ? 1 : 0}
      >
        {t`Receive`}
      </Button>
    </>
  );
}
