import { useSwapFlag } from '@/features/feature-flags';
import { t } from '@lingui/core/macro';

import { Button, ButtonProps } from '@leather.io/ui/native';

interface ActionButtonsProps {
  fullWidth?: boolean;
  size?: ButtonProps['size'];
  onSend?(): void;
  onReceive?(): void;
  onSwap?(): void;
}

export function ActionButtons({
  fullWidth = false,
  size = 'md',
  onSend,
  onReceive,
  onSwap,
}: ActionButtonsProps) {
  const isSwapEnabled = useSwapFlag();

  return (
    <>
      {onSend && (
        <Button onPress={onSend} minWidth={86} size={size} flex={fullWidth ? 1 : 0}>
          {t`Send`}
        </Button>
      )}
      {onReceive && (
        <Button
          onPress={onReceive}
          minWidth={86}
          size={size}
          variant="outline"
          flex={fullWidth ? 1 : 0}
        >
          {t`Receive`}
        </Button>
      )}
      {onSwap && isSwapEnabled && (
        <Button
          onPress={onSwap}
          minWidth={86}
          size={size}
          variant="outline"
          flex={fullWidth ? 1 : 0}
        >
          {t`Swap`}
        </Button>
      )}
    </>
  );
}
