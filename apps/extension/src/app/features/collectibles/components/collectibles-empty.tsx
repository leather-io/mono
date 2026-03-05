import { useLocation, useNavigate } from 'react-router';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { BNS_REGISTRATION_URL } from '@leather.io/constants';
import { Button } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { useZeroIndexTaprootAddress } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';

interface NftItem {
  title: string;
  caption: string;
  image: string;
  action: string;
  onAction(): void;
}

function createNftItemTestId(item: NftItem): string {
  const action = item.action.toLowerCase();
  const title = item.title.toLowerCase().replace(/[\s.]/g, '-');
  return `collectibles-empty-${action}-${title}`;
}

export function CollectiblesEmpty() {
  const navigate = useNavigate();
  const location = useLocation();
  const btcAddressTaproot = useZeroIndexTaprootAddress();

  const backgroundLocation = location;

  const nftItems: NftItem[] = [
    {
      title: '.btc domain',
      caption: 'Get your .btc domain',
      image: '/assets/images/btc-domain.png',
      action: 'Register',
      onAction: () => openInNewTab(BNS_REGISTRATION_URL),
    },
    {
      title: 'Stacks NFT',
      caption: 'Stacks Blockchain',
      image: '/assets/images/stx-nft.png',
      action: 'Receive',
      onAction: () =>
        void navigate(`${RouteUrls.Home}${RouteUrls.ReceiveStx}`, {
          state: { backgroundLocation },
        }),
    },
    {
      title: 'Ordinal Inscriptions',
      caption: 'Bitcoin Blockchain',
      image: '/assets/images/ord-inscription.png',
      action: 'Receive',
      onAction: () =>
        void navigate(`${RouteUrls.Home}${RouteUrls.ReceiveCollectibleOrdinal}`, {
          state: { backgroundLocation, btcAddressTaproot },
        }),
    },
  ];

  return (
    <Stack gap="space.02" data-testid="collectibles-empty">
      <Stack gap="space.01">
        <styled.h3 textStyle="label.01" margin="0">
          Get your first NFT
        </styled.h3>
        <styled.p textStyle="caption.01" color="ink.text-subdued" margin="0">
          Add your first NFT by buying or transferring from another account.
        </styled.p>
      </Stack>

      {nftItems.map(item => (
        <Flex key={item.title} alignItems="center" gap="space.03" width="100%" py="space.03">
          <styled.img
            src={item.image}
            alt={item.title}
            width="36px"
            height="36px"
            borderRadius="xs"
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

          <Button
            variant="outline"
            size="sm"
            onClick={item.onAction}
            flexShrink={0}
            data-testid={createNftItemTestId(item)}
          >
            {item.action}
          </Button>
        </Flex>
      ))}
    </Stack>
  );
}
