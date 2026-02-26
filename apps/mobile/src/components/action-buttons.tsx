import { useOnramperBuyFlag, useOnramperSellFlag, useSwapFlag } from '@/features/feature-flags';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/core/macro';

import { Button, ButtonProps } from '@leather.io/ui/native';

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
  const isSwapEnabled = useSwapFlag();
  const isOnramperBuyEnabled = useOnramperBuyFlag();
  const isOnramperSellEnabled = useOnramperSellFlag();

  return (
    <>
      {onSend && (
        <Button
          onPress={onSend}
          minWidth={86}
          size={size}
          flex={fullWidth ? 1 : 0}
          testID={TestId.actionButtonSend}
        >
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
          testID={TestId.actionButtonReceive}
        >
          {t`Receive`}
        </Button>
      )}
      {onBuy && isOnramperBuyEnabled && (
        <Button
          onPress={onBuy}
          minWidth={86}
          size={size}
          variant="outline"
          flex={fullWidth ? 1 : 0}
          testID={TestId.actionButtonBuy}
        >
          {t`Buy`}
        </Button>
      )}
      {onSell && isOnramperSellEnabled && (
        <Button
          onPress={onSell}
          minWidth={86}
          size={size}
          variant="outline"
          flex={fullWidth ? 1 : 0}
          testID={TestId.actionButtonSell}
        >
          {t`Sell`}
        </Button>
      )}
      {onSwap && isSwapEnabled && (
        <Button
          onPress={onSwap}
          minWidth={86}
          size={size}
          variant="outline"
          flex={fullWidth ? 1 : 0}
          testID={TestId.actionButtonSwap}
        >
          {t`Swap`}
        </Button>
      )}
    </>
  );
}
