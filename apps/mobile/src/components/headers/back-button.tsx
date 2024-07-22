import ArrowLeft from '@/assets/arrow-left.svg';

import { TouchableOpacity } from '@leather.io/ui/native';

export function BackButtonHeader({ onPress }: { onPress?(): void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      height={48}
      width={48}
      justifyContent="center"
      alignItems="center"
    >
      <ArrowLeft height={24} width={24} />
    </TouchableOpacity>
  );
}
