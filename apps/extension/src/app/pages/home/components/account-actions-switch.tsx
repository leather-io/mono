import { useFlags } from '@app/features/feature-flags';

import { AccountActions as AccountActionsLegacy } from './account-actions';
import { AccountActions as AccountActionsCurrent } from './account-actions-current/account-actions';

export function AccountActionsSwitch() {
  const { extensionRevamp } = useFlags();
  return extensionRevamp ? <AccountActionsCurrent /> : <AccountActionsLegacy />;
}
