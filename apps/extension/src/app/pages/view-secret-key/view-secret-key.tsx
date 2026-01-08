import { useFlags } from '@app/features/feature-flags';

import { ViewSecretKey as ViewSecretKeyCurrent } from './view-secret-key-current';
import { ViewSecretKey as ViewSecretKeyLegacy } from './view-secret-key-legacy';

export function ViewSecretKey() {
  const { extensionRevamp } = useFlags();
  return extensionRevamp ? <ViewSecretKeyCurrent /> : <ViewSecretKeyLegacy />;
}
