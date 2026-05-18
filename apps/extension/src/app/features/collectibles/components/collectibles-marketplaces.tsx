import { Stack, styled } from 'leather-styles/jsx';

import { GAMMA_URL } from '@leather.io/constants';
import { Pressable } from '@leather.io/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';

interface MarketplaceItem {
  name: string;
  description: string;
  url: string;
  image: string;
}

const marketplaces: MarketplaceItem[] = [
  {
    name: 'Gamma',
    description: 'Bitcoin NFTs and Web3 creativity built on Stacks.',
    url: GAMMA_URL,
    image: '/assets/images/gamma-marketplace.png',
  },
];

export function CollectiblesMarketplaces() {
  return (
    <Stack gap="space.00" data-testid="collectibles-marketplaces">
      <styled.div py="space.03">
        <styled.h2 textStyle="label.01" margin="0">
          Discover marketplaces
        </styled.h2>
      </styled.div>

      {marketplaces.map(item => (
        <Pressable
          key={item.url}
          type="button"
          display="flex"
          alignItems="flex-start"
          gap="space.03"
          py="space.03"
          textAlign="left"
          bg="ink.background-primary"
          _before={{ top: 0, bottom: 0, borderRadius: 'sm' }}
          onClick={() => openInNewTab(item.url)}
        >
          <styled.img
            src={item.image}
            alt={item.name}
            width="40px"
            height="40px"
            borderRadius="sm"
            objectFit="cover"
          />

          <Stack gap="space.00" flex="1" minWidth={0}>
            <styled.span textStyle="label.01">{item.name}</styled.span>
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {item.description}
            </styled.span>
          </Stack>
        </Pressable>
      ))}
    </Stack>
  );
}
