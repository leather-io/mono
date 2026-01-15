import { FullScreenButton } from '@app/components/full-screen-button';
import { Header } from '@app/components/layout/headers/header';
import { HeaderAccountSelector } from '@app/components/layout/headers/header-account-selector';
import { HeaderGrid, HeaderGridRightCol } from '@app/components/layout/headers/header-grid';
import { LogoBox } from '@app/components/layout/headers/logo-box';
import { useFlags } from '@app/features/feature-flags';
import { Settings } from '@app/features/settings/settings';

export function HomeHeader() {
  const { extensionRevamp } = useFlags();
  return (
    <Header>
      <HeaderGrid
        leftCol={extensionRevamp ? <HeaderAccountSelector /> : <LogoBox hideBelow={undefined} />}
        rightCol={
          <HeaderGridRightCol>
            <FullScreenButton />
            <Settings />
          </HeaderGridRightCol>
        }
      />
    </Header>
  );
}
