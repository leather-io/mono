import { Stack, styled } from 'leather-styles/jsx';

import { BNS_REGISTRATION_URL } from '@leather.io/constants';
import { Pressable } from '@leather.io/ui';

import { useReceiveDialog } from '@app/common/receive/use-receive-dialog-context';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';

interface NftItem {
  title: string;
  caption: string;
  image: string;
  testId: string;
  onAction(): void;
}

export function CollectiblesEmpty() {
  const { showReceive } = useReceiveDialog();

  const nftItems: NftItem[] = [
    {
      title: 'Register .btc domain',
      caption: 'Decentralized Bitcoin identity',
      image: '/assets/images/btc-domain.png',
      testId: 'collectibles-empty-register-btc-domain',
      onAction: () => openInNewTab(BNS_REGISTRATION_URL),
    },
    {
      title: 'Receive Stacks NFT',
      caption: 'Transfer from another account',
      image: '/assets/images/stx-nft.png',
      testId: 'collectibles-empty-receive-stacks-nft',
      onAction: () => showReceive('stx'),
    },
    {
      title: 'Discover Stacks NFTs',
      caption: 'Browse on Gamma',
      image: '/assets/images/gamma-marketplace.png',
      testId: 'collectibles-empty-discover-stacks-nfts',
      onAction: () => openInNewTab('https://stacks.gamma.io/'),
    },
  ];

  return (
    <Stack gap="space.00" data-testid="collectibles-empty">
      <Stack gap="space.01" pb="space.04">
        <styled.h3 textStyle="label.01" margin="0">
          Get your first NFT
        </styled.h3>
        <styled.p textStyle="label.03" color="ink.text-primary" margin="0">
          Add your first NFT by buying or transferring from another account.
        </styled.p>
      </Stack>

      {nftItems.map(item => (
        <Pressable
          key={item.title}
          type="button"
          display="flex"
          alignItems="center"
          gap="space.03"
          py="space.03"
          textAlign="left"
          bg="ink.background-primary"
          _before={{ top: 0, bottom: 0, borderRadius: 'sm' }}
          onClick={item.onAction}
          data-testid={item.testId}
        >
          <styled.img
            src={item.image}
            alt={item.title}
            width="40px"
            height="40px"
            borderRadius="sm"
            boxShadow="inset 0 0 0 1px token(colors.ink.border-transparent)"
            objectFit="cover"
            flexShrink={0}
          />

          <Stack gap="space.00" flex="1" minWidth={0}>
            <styled.span
              textStyle="label.02"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {item.title}
            </styled.span>
            <styled.span
              textStyle="caption.01"
              color="ink.text-subdued"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {item.caption}
            </styled.span>
          </Stack>
        </Pressable>
      ))}
    </Stack>
  );
}
