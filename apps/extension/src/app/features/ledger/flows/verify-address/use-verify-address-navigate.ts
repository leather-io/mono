import { useLocation, useNavigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';

import { type VerifyAddressVariant, verifyAddressPaths } from './verify-address-paths';

export function useVerifyAddressNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  return (variant: VerifyAddressVariant) => {
    analytics.track('address_verification_started', { type: variant });
    const path = `/${verifyAddressPaths[variant]}/${RouteUrls.ConnectLedger}`;
    whenPageMode({
      full() {
        void navigate(path, {
          state: { backgroundLocation: { pathname: RouteUrls.Home }, fromLocation: location },
        });
      },
      popup() {
        void openIndexPageInNewTab(path);
      },
    })();
  };
}
