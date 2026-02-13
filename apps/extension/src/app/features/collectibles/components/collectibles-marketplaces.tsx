import { Stack, styled } from 'leather-styles/jsx';

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
    url: 'https://gamma.io',
    image: 'assets/images/gamma-marketplace.png',
  },
  {
    name: 'Magic Eden',
    description: 'Leading multi-chain marketplace across Bitcoin, Solana, and more',
    url: 'https://magiceden.io',
    image: 'assets/images/magic-eden-marketplace.png',
  },
  {
    name: 'Ordinals Wallet',
    description: 'Non-custodial wallet and marketplace for Ordinals and more',
    url: 'https://ordinalswallet.com',
    image: 'https://www.google.com/s2/favicons?domain=ordinalswallet.com&sz=128',
  },
];

export function CollectiblesMarketplaces() {
  return (
    <Stack gap="space.00">
      <styled.div px="space.03" py="space.03">
        <styled.h2 textStyle="label.01" margin="0">
          Discover marketplaces
        </styled.h2>
      </styled.div>

      {marketplaces.map(item => (
        <styled.button
          key={item.url}
          type="button"
          display="flex"
          alignItems="center"
          gap="space.03"
          width="100%"
          px="space.03"
          py="space.03"
          textAlign="left"
          bg="ink.background-primary"
          _hover={{ bg: 'ink.component-background-hover', cursor: 'pointer' }}
          onClick={() => openInNewTab(item.url)}
        >
          <styled.img
            src={item.image}
            alt={item.name}
            width="48px"
            height="48px"
            borderRadius="sm"
            objectFit="cover"
          />

          <Stack gap="space.01" flex="1">
            <styled.span
              textStyle="label.01"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {item.name}
            </styled.span>
            <styled.span
              textStyle="caption.01"
              color="ink.text-subdued"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {item.description}
            </styled.span>
          </Stack>
        </styled.button>
      ))}
    </Stack>
  );
}
