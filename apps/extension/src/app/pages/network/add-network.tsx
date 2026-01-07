import { Flex } from 'leather-styles/jsx';

import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';

import { NetworkForm } from './components/network-form';

export function AddNetwork() {
  return (
    <Flex height="100vh" direction="column">
      <Header px="space.04">
        <HeaderGrid leftCol={<HeaderBackButton />} rightCol={null} />
      </Header>

      <NetworkForm isEditNetworkMode={false} />
    </Flex>
  );
}
