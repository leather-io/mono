import { useCallback } from 'react';

import { useRouter } from 'expo-router';

export function useOpenURL() {
  const router = useRouter();
  const openURL = useCallback(
    (url: string) => {
      if (router.canDismiss()) router.dismissAll();
      router.navigate(`/browser?url=${url}`);
    },
    [router]
  );
  return { openURL };
}
