import { TestId } from '@/shared/test-id';
import { t } from '@lingui/core/macro';

import { Pressable, Text } from '@leather.io/ui/native';

interface AmountSendMaxButtonProps {
  onPress(): void;
}

export function AmountSendMaxButton({ onPress }: AmountSendMaxButtonProps) {
  return (
    <Pressable hitSlop={16} onPress={onPress} testID={TestId.sendMaxButton}>
      <Text variant="label02" textTransform="uppercase">
        {t`Max`}
      </Text>
    </Pressable>
  );
}
