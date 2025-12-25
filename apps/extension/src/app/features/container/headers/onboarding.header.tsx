import { useNavigate } from 'react-router';

import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { ArrowLeftIcon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { HeaderSettingsButton } from '@app/components/layout/headers/header-settings-button';
import { LogoBox } from '@app/components/layout/headers/logo-box';

interface OnboardingHeaderProps {
  hideLogo?: boolean;
}

export function OnboardingHeader({ hideLogo = false }: OnboardingHeaderProps) {
  const navigate = useNavigate();

  return (
    <Header px="space.05">
      <HeaderGrid
        leftCol={
          <>
            <HeaderActionButton
              icon={<ArrowLeftIcon />}
              onAction={() => navigate(-1)}
              dataTestId={SharedComponentsSelectors.HeaderBackBtn}
            />
            {!hideLogo && <LogoBox onClick={() => navigate(RouteUrls.Home)} />}
          </>
        }
        rightCol={<HeaderSettingsButton />}
      />
    </Header>
  );
}
