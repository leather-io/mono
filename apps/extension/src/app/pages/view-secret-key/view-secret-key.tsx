import { useEffect, useState } from 'react';

import { analytics } from '@shared/utils/analytics';

import { LockedViewSecretKey } from './locked-view-secret-key';
import { UnlockedViewSecretKey } from './unlocked-view-secret-key';

export function ViewSecretKey() {
  const [showSecretKey, setShowSecretKey] = useState(false);

  useEffect(() => {
    analytics.page('view', '/save-secret-key');
  }, []);

  if (showSecretKey) {
    return <UnlockedViewSecretKey />;
  }

  return <LockedViewSecretKey onUnlock={() => setShowSecretKey(true)} />;
}
