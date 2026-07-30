import { Flex, styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { sbtcContent } from '~/content/sbtc-content';
import { openExternalLink } from '~/utils/external-links';

import { Button, ExternalLinkIcon } from '@leather.io/ui';

export function SbtcRewardsSunsetCallout(props: HTMLStyledProps<'div'>) {
  const { rewardsSunset } = sbtcContent;

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
        data-testid="sbtc-rewards-sunset-callout"
      >
        <Flex flexDirection="column" flex="1" maxWidth="65ch">
          <styled.h3 textStyle="heading.05">{rewardsSunset.title}</styled.h3>
          <styled.p textStyle="label.02" color="ink.text-subdued" mt="space.01">
            {rewardsSunset.description}
          </styled.p>
        </Flex>
        <Flex alignItems="center" flexShrink={0}>
          <Button
            variant="outline"
            data-testid="sbtc-rewards-sunset-link"
            onClick={() => openExternalLink(rewardsSunset.url)}
            iconEnd={ExternalLinkIcon}
          >
            {rewardsSunset.linkLabel}
          </Button>
        </Flex>
      </Flex>
    </styled.div>
  );
}
