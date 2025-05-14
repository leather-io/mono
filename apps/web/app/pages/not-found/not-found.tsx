import { Link } from 'react-router';

import { Flex, VStack, styled } from 'leather-styles/jsx';
import { Page } from '~/features/page/page';

import { Button } from '@leather.io/ui';

export function NotFound() {
  return (
    <Page>
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDir="column"
        minHeight="calc(100vh - 142px)"
        py="space.08"
      >
        <VStack gap="space.06" alignItems="center" maxWidth="640px" textAlign="center">
          <styled.h1 textStyle="heading.04">Oops! It seems like you took a wrong turn.</styled.h1>
          <styled.div>
            <Link to="/stacking">
              <Button variant="outline">Return home</Button>
            </Link>
          </styled.div>
        </VStack>
      </Flex>
    </Page>
  );
}
