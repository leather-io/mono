import { FullScreenButton } from '@app/components/full-screen-button';
import { Header } from '@app/components/layout/headers/header';
import { HeaderAccountSelector } from '@app/components/layout/headers/header-account-selector';
import { HeaderGrid, HeaderGridRightCol } from '@app/components/layout/headers/header-grid';
import { Settings } from '@app/features/settings/settings';

export function HomeHeader() {
  return (
    <Header>
      <HeaderGrid
        leftCol={<HeaderAccountSelector />}
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
