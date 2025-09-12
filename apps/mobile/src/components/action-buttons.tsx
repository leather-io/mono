import { t } from '@lingui/core/macro';
import { useRouter } from 'expo-router';

import { Button, ButtonProps } from '@leather.io/ui/native';

interface ActionButtonsProps {
  canSend?: boolean;
  fullWidth?: boolean;
  size?: ButtonProps['size'];
  onSend(): void;
  onReceive(): void;
}

export function ActionButtons({
  canSend = true,
  fullWidth = false,
  size = 'md',
  onSend,
  onReceive,
}: ActionButtonsProps) {
  const { navigate } = useRouter();

  return (
    <>
      <Button
        onPress={onSend}
        disabled={!canSend}
        minWidth={86}
        size={size}
        flex={fullWidth ? 1 : 0}
      >
        {t`Send`}
      </Button>

      <Button
        onPress={onReceive}
        minWidth={86}
        size={size}
        variant="outline"
        flex={fullWidth ? 1 : 0}
      >
        {t`Receive`}
      </Button>

      <Button
        onPress={() => navigate({ pathname: '/swap' })}
        minWidth={86}
        size={size}
        variant="outline"
        flex={fullWidth ? 1 : 0}
      >
        {t`Swap`}
      </Button>
    </>
  );
}
