import { useEffect } from 'react';

import { analytics } from '@/utils/analytics';
import { useGlobalSearchParams, usePathname } from 'expo-router';

export function usePageViewTracking() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    void analytics?.screen(pathname, {
      params,
    });
  }, [pathname, params]);
}
