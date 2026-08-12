import { Box, Circle } from 'leather-styles/jsx';
import { ConnectActionRow, ConnectCard } from '~/components/connect-card/connect-card';
import { useLeatherConnect } from '~/store/addresses';
import { openExternalLink } from '~/utils/external-links';

import { LEATHER_EXTENSION_CHROME_STORE_URL } from '@leather.io/constants';
import { Button, DownloadIcon, UserIcon } from '@leather.io/ui';

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
      <ConnectCard
        mt="-60px"
        position="relative"
        title="Get started"
        description="Connect a wallet to access your portfolio"
      >
        <ConnectActionRow
          hideBodyBelowSm
          img={
            <Circle border="default" size="48px">
              <UserIcon />
            </Circle>
          }
          title="Connect"
          description="Connect a wallet to reveal your portfolio"
          trailing={
            <Button width="100px" height="48px" onClick={() => connect()}>
              Connect
            </Button>
          }
        />
        <ConnectActionRow
          hideBodyBelowSm
          img={
            <Circle border="default" size="48px">
              <DownloadIcon />
            </Circle>
          }
          title="Install"
          description="Add Leather extension to your browser"
          trailing={
            <Button
              width="100px"
              height="48px"
              onClick={() => openExternalLink(LEATHER_EXTENSION_CHROME_STORE_URL)}
            >
              Install
            </Button>
          }
        />
      </ConnectCard>
    </Box>
  );
}
