import { PropsWithChildren, ReactElement } from 'react';

import { NonFungibleCryptoAsset } from '@leather.io/models';
import { Box, StxAvatarIcon } from '@leather.io/ui/native';

const overlayOffset = 12;

function getCollectibleTypeIcon(protocol: NonFungibleCryptoAsset['protocol']): ReactElement | null {
  switch (protocol) {
    case 'sip9':
      return <StxAvatarIcon size="sm" />;
    default:
      return null;
  }
}

interface CollectibleTypeIconOverlayProps extends PropsWithChildren {
  protocol: NonFungibleCryptoAsset['protocol'];
}

export function CollectibleTypeIconOverlay({
  protocol,
  children,
}: CollectibleTypeIconOverlayProps) {
  const icon = getCollectibleTypeIcon(protocol);

  if (!icon) return <>{children}</>;

  return (
    <Box position="relative">
      {children}
      <Box
        pointerEvents="none"
        position="absolute"
        left={overlayOffset}
        bottom={overlayOffset}
        zIndex="100"
      >
        {icon}
      </Box>
    </Box>
  );
}
