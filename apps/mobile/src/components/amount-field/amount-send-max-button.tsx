import { t } from '@lingui/macro';

import { Pressable, Text } from '@leather.io/ui/native';

interface AmountSendMaxButtonProps {
  onPress(): void;
}

export function AmountSendMaxButton({ onPress }: AmountSendMaxButtonProps) {
  return (
    <Pressable hitSlop={16} onPress={onPress}>
      <Text variant="label02" textTransform="uppercase">
        {t({
          id: 'send_form.max_label',
          message: 'Max',
        })}
      </Text>
    </Pressable>
  );
}
