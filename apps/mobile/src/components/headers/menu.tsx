import { BarsTwoIcon, TouchableOpacity } from '@leather.io/ui/native';

export function MenuHeader({ onPress }: { onPress?(): void }) {
  return (
    <TouchableOpacity onPress={onPress} p="3">
      <BarsTwoIcon />
    </TouchableOpacity>
  );
}
