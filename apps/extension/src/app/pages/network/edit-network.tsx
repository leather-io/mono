import { Flex } from 'leather-styles/jsx';

import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { HeaderSettingsButton } from '@app/components/layout/headers/header-settings-button';

import { NetworkForm } from './components/network-form';

export function EditNetwork() {
  return (
    <Flex height="100vh" direction="column">
      <Header px="space.04">
        <HeaderGrid leftCol={<HeaderBackButton />} rightCol={<HeaderSettingsButton />} />
      </Header>

      <NetworkForm isEditNetworkMode />
    </Flex>
  );
}
