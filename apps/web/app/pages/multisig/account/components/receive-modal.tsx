import QRCode from 'react-qr-code';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';

import type { VaultAccount } from '@leather.io/models';
import { CloseIcon, IconButton, Sheet } from '@leather.io/ui';

import { CopyAddress } from '../../components/copy-address';

interface ReceiveModalProps {
  account: VaultAccount;
  onClose(): void;
}

export function ReceiveModal({ account, onClose }: ReceiveModalProps) {
  const chainLabel = account.network.startsWith('btc') ? 'BTC' : 'STX';

  return (
    <Sheet
      isShowing
      onClose={onClose}
      header={
        <Flex
          alignItems="center"
          justifyContent="space-between"
          gap="space.04"
          px="space.05"
          py="space.04"
          width="100%"
          minHeight="headerHeight"
        >
          <styled.h2 textStyle="heading.05">Receive to {account.name}</styled.h2>
          <IconButton icon={<CloseIcon />} onClick={onClose} />
        </Flex>
      }
    >
      <Flex direction="column" alignItems="center" gap="space.05" px="space.05" pb="space.06">
        <styled.p textStyle="caption.01" color="ink.text-subdued" textAlign="center">
          Assets sent to this address require {account.threshold} of {account.signers.length}{' '}
          signatures to move. Only send {chainLabel} network assets.
        </styled.p>
        <Box p="space.04" borderRadius="md" bg="ink.background-primary">
          <QRCode
            bgColor={token('colors.ink.background-primary')}
            fgColor={token('colors.ink.text-primary')}
            size={132}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            value={account.multisigAddress}
            viewBox="0 0 132 132"
          />
        </Box>
        <Box maxWidth="260px" textAlign="center">
          <CopyAddress addr={account.multisigAddress} grouped />
        </Box>
      </Flex>
    </Sheet>
  );
}
