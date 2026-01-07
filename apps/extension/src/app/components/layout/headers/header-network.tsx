import { NetworkSwitcherBadge } from '@app/pages/settings/components/network-switcher';

import { HeaderGridRightCol } from './header-grid';

export function HeaderNetwork() {
  return (
    <HeaderGridRightCol>
      <NetworkSwitcherBadge />
    </HeaderGridRightCol>
  );
}
