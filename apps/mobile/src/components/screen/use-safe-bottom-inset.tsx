import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useSafeBottomInset() {
  const minimumOffset = 24;
  const { bottom } = useSafeAreaInsets();

  return Math.max(minimumOffset, bottom);
}
