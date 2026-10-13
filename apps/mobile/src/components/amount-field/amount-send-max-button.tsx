import { t } from '@lingui/core/macro';

import { Pressable, Text } from '@leather.io/ui/native';

interface AmountSendMaxButtonProps {
  onPress(): void;
}

export function AmountSendMaxButton({ onPress }: AmountSendMaxButtonProps) {
  return (
    <Pressable hitSlop={16} onPress={onPress}>
      <Text variant="label02" textTransform="uppercase">
        {t`Max`}
      </Text>
    </Pressable>
  );
}
