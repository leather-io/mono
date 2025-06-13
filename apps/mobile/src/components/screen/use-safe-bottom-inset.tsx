import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActionBarOffset } from '@/components/action-bar/action-bar';
import { useActionBar } from '@/components/action-bar/use-action-bar';

export function useSafeBottomInset() {
  const minimumOffset = 24;
  const { isActionBarVisible } = useActionBar();
  const { actionBarOffset } = useActionBarOffset();
  const { bottom } = useSafeAreaInsets();
  const safeOffset = Math.max(bottom, isActionBarVisible ? actionBarOffset : 0);

  return Math.max(minimumOffset, safeOffset);
}
