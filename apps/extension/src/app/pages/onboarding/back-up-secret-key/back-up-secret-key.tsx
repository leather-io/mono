import { useFlags } from '@app/features/feature-flags';

import { BackUpSecretKeyPage as BackUpSecretKeyPageCurrent } from './back-up-secret-key-current';
import { BackUpSecretKeyPage as BackUpSecretKeyPageLegacy } from './back-up-secret-key-legacy';

export function BackUpSecretKeyPage() {
  const { extensionRevamp } = useFlags();

  return extensionRevamp ? <BackUpSecretKeyPageCurrent /> : <BackUpSecretKeyPageLegacy />;
}
