import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Favicon } from '@leather.io/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';

interface MarketplaceItem {
  name: string;
  description: string;
  url: string;
  faviconOrigin: string;
}

const marketplaces: MarketplaceItem[] = [
  {
    name: 'Gamma',
    description: 'Bitcoin NFTs and Web3 creativity built on Stacks.',
    url: 'https://gamma.io',
    faviconOrigin: 'gamma.io',
  },
  {
    name: 'Magic Eden',
    description: 'Leading multi-chain marketplace across Bitcoin, Solana, and more',
    url: 'https://magiceden.io',
    faviconOrigin: 'magiceden.io',
  },
  {
    name: 'Ordinals Wallet',
    description: 'Non-custodial wallet and marketplace for Ordinals and more',
    url: 'https://ordinalswallet.com',
    faviconOrigin: 'ordinalswallet.com',
  },
];

export function CollectiblesMarketplaces() {
  return (
    <Stack gap="space.00">
      <styled.div px={{ base: 0, md: 'space.05' }} py="space.03">
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
          px={{ base: 0, md: 'space.05' }}
          py="space.03"
          textAlign="left"
          bg="ink.background-primary"
          _hover={{ bg: 'ink.component-background-hover', cursor: 'pointer' }}
          onClick={() => openInNewTab(item.url)}
        >
          <Flex
            width="48px"
            height="48px"
            borderRadius="sm"
            overflow="hidden"
            bg="ink.background-secondary"
            alignItems="center"
            justifyContent="center"
          >
            {/* Remove `as any` once ui types accept number in mono */}
            <Favicon origin={item.faviconOrigin} size={48 as any} />
          </Flex>

          <Stack gap="space.01" flex="1">
            <styled.span textStyle="label.01" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
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


