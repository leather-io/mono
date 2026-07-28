import { Box, Flex, styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { openExternalLink } from '~/utils/external-links';

import { Button, ExternalLinkIcon } from '@leather.io/ui';

export function DualStackingTransition(props: HTMLStyledProps<'div'>) {
  const { dualStackingTransition } = bitcoinStakingContent;

  return (
    <styled.div {...props}>
      <Flex
        border="default"
        borderRadius="sm"
        p="space.05"
        gap={['space.04', 'space.04', 'space.07']}
        justifyContent="space-between"
        alignItems={['flex-start', 'flex-start', 'center']}
        flexDirection={['column', 'column', 'row']}
      >
        <Flex flexDirection="column" flex="1" maxWidth="65ch">
          <Box>
            <img src="/images/dual-stacking.png" width="105px" height="32px" alt="Dual Stacking" />
          </Box>
          <styled.h3 textStyle="heading.05" mt="space.03">
            {dualStackingTransition.title}
          </styled.h3>
          <styled.p textStyle="label.02" color="ink.text-subdued" mt="space.01">
            {dualStackingTransition.description}
          </styled.p>
        </Flex>
        <Flex alignItems="center" flexShrink={0}>
          <Button
            variant="outline"
            data-testid="dual-stacking-transition-link"
            onClick={() => openExternalLink(dualStackingTransition.url)}
            iconEnd={ExternalLinkIcon}
          >
            {dualStackingTransition.linkLabel}
          </Button>
        </Flex>
      </Flex>
    </styled.div>
  );
}
