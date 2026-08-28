import { useOnramperBuyFlag, useOnramperSellFlag, useSwapFlag } from '@/features/feature-flags';
import { useSettings } from '@/store/settings/settings';
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
  const { networkPreference } = useSettings();
  const isMainnet = networkPreference.chain.bitcoin.mode === 'mainnet';

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
      {onBuy && isOnramperBuyEnabled && (
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
      {onSell && isOnramperSellEnabled && (
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
      {onSwap && isSwapEnabled && isMainnet && (
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
