// The QR uses error-correction level H, so the covered centre still scans.
import type { ReactNode } from 'react';
import QRCode from 'react-qr-code';

import { Box, Flex } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';

import { defineRecipeMeta } from './recipe-meta';

export const addressQrMeta = defineRecipeMeta({
  name: 'Address QR (AddressQr)',
  mirrors: 'apps/extension/src/app/pages/receive/components/receive-tokens.layout.tsx',
  useWhen: [
    'A receive screen for one asset or one network: the token icon sits in the QR centre',
    'Any screen whose subject is an asset: lead with its token icon (ItemLayout img, sheet header, QR centre)',
  ],
  dontUseWhen: [
    {
      situation: 'An address that receives many assets',
      use: 'AddressQr without an icon, or the network icon',
    },
    { situation: 'Decoration with no asset as the subject', use: 'nothing' },
  ],
});

interface AddressQrProps {
  address: string;
  icon?: ReactNode;
  size?: number;
}

export function AddressQr({ address, icon, size = 132 }: AddressQrProps) {
  return (
    <Flex position="relative" alignItems="center" justifyContent="center">
      <QRCode
        bgColor={token('colors.ink.background-primary')}
        fgColor={token('colors.ink.text-primary')}
        level={icon ? 'H' : 'L'}
        size={size}
        value={address}
        viewBox={`0 0 ${size} ${size}`}
      />
      {icon ? (
        <Box
          position="absolute"
          display="flex"
          p="space.01"
          bg="ink.background-primary"
          borderRadius="round"
          aria-hidden
        >
          {icon}
        </Box>
      ) : null}
    </Flex>
  );
}
