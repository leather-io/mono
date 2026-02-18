import { RouteUrls } from '@shared/route-urls';

import { FullScreenButton } from '@app/components/full-screen-button';
import { Header } from '@app/components/layout/headers/header';
import { HeaderGrid, HeaderGridRightCol } from '@app/components/layout/headers/header-grid';
import { LogoBox } from '@app/components/layout/headers/logo-box';
import { Settings } from '@app/features/settings/settings';
import { useNavigate } from '@app/routes/compat';

export function UnlockHeader() {
  const navigate = useNavigate();

  return (
    <Header>
      <HeaderGrid
        leftCol={
          <LogoBox onClick={() => navigate(RouteUrls.Home)} hideBelow={undefined} hideFrom="sm" />
        }
        rightCol={
          <HeaderGridRightCol>
            <FullScreenButton />
            <Settings canLockWallet={false} />
          </HeaderGridRightCol>
        }
      />
    </Header>
  );
}
