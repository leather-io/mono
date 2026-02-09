import { useLocation, useNavigate } from 'react-router';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { BTC_US_URL } from '@leather.io/constants';
import { Button, GlobeTiltedIcon, OrdinalAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';

interface NftOptionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  buttonLabel: string;
  onButtonClick(): void;
}

function NftOption({ icon, title, subtitle, buttonLabel, onButtonClick }: NftOptionProps) {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      py="space.03"
      gap="space.03"
      borderBottom="default"
    >
      <Flex alignItems="center" gap="space.03" minWidth={0}>
        <Flex
          width="48px"
          height="48px"
          borderRadius="xs"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          overflow="hidden"
        >
          {icon}
        </Flex>
        <Stack gap="space.00" minWidth={0}>
          <styled.span textStyle="label.02" overflow="hidden" textOverflow="ellipsis">
            {title}
          </styled.span>
          <styled.span
            textStyle="caption.01"
            color="ink.text-subdued"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {subtitle}
          </styled.span>
        </Stack>
      </Flex>
      <Button variant="outline" size="sm" onClick={onButtonClick}>
        {buttonLabel}
      </Button>
    </Flex>
  );
}

export function CollectiblesEmpty() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegisterBtcDomain = () => {
    openInNewTab(BTC_US_URL);
  };

  const handleReceiveStacksNft = () => {
    void navigate(`${RouteUrls.Home}${RouteUrls.ReceiveStx}`, {
      state: { backgroundLocation: location },
    });
  };

  const handleReceiveOrdinal = () => {
    void navigate(`${RouteUrls.Home}${RouteUrls.ReceiveCollectibleOrdinal}`, {
      state: { backgroundLocation: location },
    });
  };

  return (
    <Stack gap="space.04">
      <Stack gap="space.01">
        <styled.h3 textStyle="label.02" margin="0">
          Get your first NFT
        </styled.h3>
        <styled.p textStyle="caption.01" color="ink.text-subdued" margin="0">
          Add your first NFT by buying or transferring from another account.
        </styled.p>
      </Stack>

      <Stack gap="space.00">
        <NftOption
          icon={
            <Box
              width="48px"
              height="48px"
              borderRadius="xs"
              bg="blue.background-primary"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <GlobeTiltedIcon color="blue.action-primary-default" />
            </Box>
          }
          title=".btc domain"
          subtitle="Get your .btc domain"
          buttonLabel="Register"
          onButtonClick={handleRegisterBtcDomain}
        />
        <NftOption
          icon={<StxAvatarIcon />}
          title="Stacks NFT"
          subtitle="Stacks Blockchain"
          buttonLabel="Receive"
          onButtonClick={handleReceiveStacksNft}
        />
        <NftOption
          icon={<OrdinalAvatarIcon />}
          title="Ordinal Inscriptions"
          subtitle="Bitcoin Blockchain"
          buttonLabel="Receive"
          onButtonClick={handleReceiveOrdinal}
        />
      </Stack>
    </Stack>
  );
}
