import { useFlags } from '@app/features/feature-flags';

import { SetPasswordPage as SetPasswordPageCurrent } from './set-password-current';
import { SetPasswordPage as SetPasswordPageLegacy } from './set-password-legacy';

export function SetPasswordPage() {
  const { extensionRevamp } = useFlags();
  return extensionRevamp ? <SetPasswordPageCurrent /> : <SetPasswordPageLegacy />;
}
