import { useCallback } from 'react';

import { useRouter } from 'expo-router';

export function useOpenUrl() {
  const router = useRouter();
  const openUrl = useCallback(
    (url: string) => {
      if (router.canDismiss()) router.dismissAll();
      router.navigate(`/browser?url=${url}`);
    },
    [router]
  );
  return { openUrl };
}
