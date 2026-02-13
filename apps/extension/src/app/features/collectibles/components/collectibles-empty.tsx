import { useLocation, useNavigate } from 'react-router';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

export function CollectiblesEmpty() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleReceive() {
    void navigate(`${RouteUrls.Home}${RouteUrls.Receive}`, {
      state: { backgroundLocation: location },
    });
  }

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      py={{ base: 'space.07', md: 'space.09' }}
      px="space.05"
      gap="space.05"
    >
      <styled.img
        src="assets/illustrations/gem.png"
        alt="Collectibles"
        width={{ base: '120px', md: '160px' }}
        height={{ base: '120px', md: '160px' }}
        objectFit="contain"
      />
      <Stack gap="space.02" alignItems="center">
        <styled.h3 textStyle="heading.05" margin="0">
          Your collection is empty
        </styled.h3>
        <styled.p textStyle="body.02" color="ink.text-subdued" margin="0" maxWidth="280px">
          Add your first collectible by buying or transferring from another wallet.
        </styled.p>
      </Stack>
      <Button variant="outline" onClick={handleReceive}>
        Receive
      </Button>
    </Flex>
  );
}
