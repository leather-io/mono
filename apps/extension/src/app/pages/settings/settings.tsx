import { Flex, styled } from 'leather-styles/jsx';

import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { HeaderNetwork } from '@app/components/layout/headers/header-network';

import { MenuButtons } from './menu-buttons';
import { StickyButtons } from './sticky-buttons';

export function SettingsPage() {
  return (
    <Flex height="100vh" direction="column">
      <Header px="space.04">
        <HeaderGrid leftCol={<HeaderBackButton />} rightCol={<HeaderNetwork />} />
      </Header>
      <Content>
        <Flex
          direction="column"
          width="100%"
          position="relative"
          justifyContent="space-between"
          height="100%"
          px="space.05"
        >
          <Flex direction="column">
            <styled.h1 textStyle="heading.03" pb="space.05">
              Settings
            </styled.h1>
            <MenuButtons />
          </Flex>
          <StickyButtons />
        </Flex>
      </Content>
    </Flex>
  );
}
