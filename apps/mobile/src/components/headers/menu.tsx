import MenuIcon from '@/assets/menu.svg';

import { TouchableOpacity } from '@leather.io/ui/native';

export function MenuHeader({ onPress }: { onPress?(): void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      height={48}
      width={48}
      justifyContent="center"
      alignItems="center"
    >
      <MenuIcon height={24} width={24} />
    </TouchableOpacity>
  );
}
