import { Box, Circle, styled } from 'leather-styles/jsx';
import { useLeatherConnect } from '~/store/addresses';
import { openExternalLink } from '~/utils/external-links';

import { LEATHER_EXTENSION_CHROME_STORE_URL } from '@leather.io/constants';
import { Button, DownloadIcon, Flag, FlagProps, UserIcon } from '@leather.io/ui';

interface WalletActionItemProps extends FlagProps {
  title: string;
  img: React.ReactElement;
  description: string;
  buttonText: string;
  onButtonClick?(): void;
}

function WalletActionItem({
  title,
  img,
  description,
  buttonText,
  onButtonClick,
  ...props
}: WalletActionItemProps) {
  return (
    <Flag img={img} border="default" borderRadius="99px" width="100%" py="space.03" {...props}>
      <Flag
        width="100%"
        reverse
        img={
          <Button
            width="100px"
            height="48px"
            mr="space.03"
            ml={[null, 'space.04']}
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        }
      >
        <Box display={['none', 'block']}>
          {title}
          <styled.p textStyle="caption.01" color="ink.text-subdued-primary">
            {description}
          </styled.p>
        </Box>
      </Flag>
    </Flag>
  );
}

interface WalletConnectionModalProps {
  isOpen: boolean;
}
export function WalletConnectionModal({ isOpen }: WalletConnectionModalProps) {
  const { connect } = useLeatherConnect();
  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      ml={[null, null, 'navbar']}
      mt="60px"
    >
      <Box
        bg="ink.background-primary"
        mt="-60px"
        p="space.06"
        borderRadius="md"
        boxShadow="0 0 2px 0 rgba(18, 16, 15, 0.12), 0 4px 8px 0 rgba(18, 16, 15, 0.08), 0 12px 24px 0 rgba(18, 16, 15, 0.08)"
        position="relative"
        animationName="slideUpAndFade"
        animationDuration="800ms"
        animationTimingFunction="cubic-bezier(0.16, 1, 0.3, 1)"
        animationDelay="240ms"
        animationFillMode="both"
        opacity="0"
        transform="translateY(20px)"
      >
        <Flag
          spacing="space.05"
          img={<styled.img src="/images/extension-logo.svg" alt="Leather logo" />}
        >
          <styled.h2 textStyle="heading.05">Get started with Leather</styled.h2>
          <styled.p textStyle="body.02">Connect Leather to access your portfolio</styled.p>
        </Flag>
        <Box mt="space.05" textStyle="label.01">
          <WalletActionItem
            title="Connect"
            description="Connect Leather to reveal your portfolio"
            buttonText="Connect"
            img={
              <Circle border="default" size="48px" ml="space.03">
                <UserIcon />
              </Circle>
            }
            onButtonClick={() => connect()}
          />

          <WalletActionItem
            mt="space.04"
            img={
              <Circle border="default" size="48px" ml="space.03">
                <DownloadIcon />
              </Circle>
            }
            title="Install"
            description="Add Leather extension to your browser"
            buttonText="Install"
            onButtonClick={() => openExternalLink(LEATHER_EXTENSION_CHROME_STORE_URL)}
          />
        </Box>
      </Box>
    </Box>
  );
}
