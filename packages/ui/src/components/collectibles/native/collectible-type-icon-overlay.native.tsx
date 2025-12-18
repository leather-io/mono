import { PropsWithChildren, ReactElement } from 'react';

import type { NonFungibleCryptoAsset } from '@leather.io/models';

import { OrdinalAvatarIcon } from '../../avatar/ordinal-avatar-icon.native';
import { StampAvatarIcon } from '../../avatar/stamp-avatar-icon.native';
import { StxAvatarIcon } from '../../avatar/stx-avatar-icon.native';
import { Box } from '../../box/box.native';

const overlayOffset = 12;

function getCollectibleTypeIcon(protocol: NonFungibleCryptoAsset['protocol']): ReactElement | null {
  switch (protocol) {
    case 'stamp':
      return <StampAvatarIcon size="sm" />;
    case 'inscription':
      return <OrdinalAvatarIcon size="sm" />;
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
