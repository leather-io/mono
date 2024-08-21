import { ArrowLeftIcon, TouchableOpacity } from '@leather.io/ui/native';

export function BackButtonHeader({ onPress }: { onPress?(): void }) {
  return (
    <TouchableOpacity onPress={onPress} p="3">
      <ArrowLeftIcon />
    </TouchableOpacity>
  );
}
