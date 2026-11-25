import { t } from '@lingui/core/macro';

import { Button, type ButtonProps } from '@leather.io/ui/native';

interface ActionButtonsProps {
  fullWidth?: boolean;
  size?: ButtonProps['size'];
  onSend?(): void;
  onReceive?(): void;
  onSwap?(): void;
  onBuy?(): void;
  onSell?(): void;
}

export function ActionButtons({
  fullWidth = false,
  size = 'md',
  onSend,
  onReceive,
  onSwap,
  onBuy,
  onSell,
}: ActionButtonsProps) {
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
      {onBuy && (
        <Button
          onPress={onBuy}
          minWidth={86}
          size={size}
          variant="outline"
          flex={fullWidth ? 1 : 0}
        >
          {t`Buy`}
        </Button>
      )}
      {onSell && (
        <Button
          onPress={onSell}
          minWidth={86}
          size={size}
          variant="outline"
          flex={fullWidth ? 1 : 0}
        >
          {t`Sell`}
        </Button>
      )}
      {onSwap && (
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
