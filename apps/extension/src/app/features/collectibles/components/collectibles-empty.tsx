import { useLocation, useNavigate } from 'react-router';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { BTC_US_URL } from '@leather.io/constants';
import { Button, StxAvatarIcon } from '@leather.io/ui';

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
    <Flex alignItems="center" justifyContent="space-between" py="space.03" gap="space.03">
      <Flex alignItems="center" gap="space.03" minWidth={0}>
        <Flex
          width="48px"
          height="48px"
          borderRadius="sm"
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

function BnsAvatarIcon() {
  return (
    <styled.svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#F09D00" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 8C15.163 8 8 15.163 8 24s7.163 16 16 16 16-7.163 16-16S32.837 8 24 8zm0 2c7.732 0 14 6.268 14 14s-6.268 14-14 14-14-6.268-14-14 6.268-14 14-14z"
        fill="white"
      />
      <path d="M24 10v28M10 24h28" stroke="white" strokeWidth="2" />
      <path d="M12 18h24M12 30h24" stroke="white" strokeWidth="1.5" />
      <ellipse cx="24" cy="24" rx="8" ry="14" stroke="white" strokeWidth="2" fill="none" />
    </styled.svg>
  );
}

function InscriptionAvatarIcon() {
  return (
    <styled.svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="8" fill="url(#inscription-gradient)" />
      <defs>
        <linearGradient
          id="inscription-gradient"
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="50%" stopColor="#9B59B6" />
          <stop offset="100%" stopColor="#3498DB" />
        </linearGradient>
      </defs>
    </styled.svg>
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
    <Stack gap="space.04" pt="space.03">
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
          icon={<BnsAvatarIcon />}
          title=".btc domain"
          subtitle="Get your .btc domain"
          buttonLabel="Register"
          onButtonClick={handleRegisterBtcDomain}
        />
        <NftOption
          icon={<StxAvatarIcon size="xl" />}
          title="Stacks NFT"
          subtitle="Stacks Blockchain"
          buttonLabel="Receive"
          onButtonClick={handleReceiveStacksNft}
        />
        <NftOption
          icon={<InscriptionAvatarIcon />}
          title="Ordinal Inscriptions"
          subtitle="Bitcoin Blockchain"
          buttonLabel="Receive"
          onButtonClick={handleReceiveOrdinal}
        />
      </Stack>
    </Stack>
  );
}
