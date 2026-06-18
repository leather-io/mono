import { FullScreenButton } from '@app/components/full-screen-button';
import { Header } from '@app/components/layout/headers/header';
import { HeaderAccountSelector } from '@app/components/layout/headers/header-account-selector';
import { HeaderGrid, HeaderGridRightCol } from '@app/components/layout/headers/header-grid';
import { Settings } from '@app/features/settings/settings';

export function HomeHeader() {
  return (
    <Header>
      <HeaderGrid
        gridTemplateColumns="minmax(0, 1fr) auto"
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
