import { useState } from 'react';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Caption } from '@leather.io/ui';

import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { HeaderNetwork } from '@app/components/layout/headers/header-network';
import { TokenList } from '@app/features/asset-list/token-list';

export function ManageTokensPage() {
  const [hasManageableTokens, setHasManageableTokens] = useState(false);

  return (
    <Flex height="100vh" direction="column">
      <Header px="space.04">
        <HeaderGrid
          leftCol={<HeaderBackButton />}
          centerCol={
            <styled.h1 textStyle="heading.05" textAlign="center">
              Manage tokens
            </styled.h1>
          }
          rightCol={<HeaderNetwork />}
        />
      </Header>
      <Content>
        <Flex
          direction="column"
          width="100%"
          position="relative"
          height="100%"
          overflowY="auto"
          px="space.05"
        >
          <Stack gap="space.00" data-testid={HomePageSelectors.ManageTokensAssetsList}>
            <TokenList
              assetRightElementVariant="toggle"
              filter="all"
              showUnmanageableTokens={false}
              setHasManageableTokens={setHasManageableTokens}
            />

            {!hasManageableTokens && (
              <Stack h="100%" justify="center" align="center" py="space.06">
                <Caption>No tokens found</Caption>
              </Stack>
            )}
          </Stack>
        </Flex>
      </Content>
    </Flex>
  );
}
