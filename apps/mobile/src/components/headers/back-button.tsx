import { ArrowLeftIcon, TouchableOpacity } from '@leather.io/ui/native';

export function BackButtonHeader({ onPress }: { onPress?(): void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      height={48}
      width={48}
      justifyContent="center"
      alignItems="center"
    >
      <ArrowLeftIcon />
    </TouchableOpacity>
  );
}
