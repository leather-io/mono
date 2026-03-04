import { Box, Flex, styled } from 'leather-styles/jsx';
import { openExternalLink } from '~/utils/external-links';

import { Button, ExternalLinkIcon } from '@leather.io/ui';

export function DualStackingPromo() {
  return (
    <Flex border="default" justifyContent="space-between" borderRadius="sm" p="space.05">
      <Flex flexDir="column">
        <Box>
          <img src="/images/dual-stacking.png" width="105px" height="32px" />
        </Box>
        <styled.h3 textStyle="heading.05" mt="space.03">
          Up to 5% APY in sBTC
        </styled.h3>
        <styled.p textStyle="label.02" color="ink.text-subdued-secondary" mt="space.01">
          Use Leather to Dual Stack and earn sBTC yield
        </styled.p>
      </Flex>
      <Flex alignItems="center">
        <Button
          variant="outline"
          onClick={() => openExternalLink('https://app.stacks.co')}
          iconEnd={ExternalLinkIcon}
        >
          Explore Dual Stacking
        </Button>
      </Flex>
    </Flex>
  );
}
