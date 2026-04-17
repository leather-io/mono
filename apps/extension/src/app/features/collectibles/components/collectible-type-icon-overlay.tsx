import { type PropsWithChildren, type ReactElement } from 'react';

import { Box } from 'leather-styles/jsx';

import type { NonFungibleCryptoAsset } from '@leather.io/models';
import { OrdinalAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

const overlayOffset = 12;

function getCollectibleTypeIcon(protocol: NonFungibleCryptoAsset['protocol']): ReactElement | null {
  switch (protocol) {
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
  'data-testid'?: string;
  'data-index'?: number;
}

export function CollectibleTypeIconOverlay({
  protocol,
  children,
  'data-testid': dataTestId,
  'data-index': dataIndex,
}: CollectibleTypeIconOverlayProps) {
  const icon = getCollectibleTypeIcon(protocol);

  if (!icon) return <>{children}</>;

  return (
    <Box position="relative" data-testid={dataTestId} data-index={dataIndex}>
      {children}
      <Box
        pointerEvents="none"
        position="absolute"
        right={overlayOffset}
        bottom={overlayOffset}
        zIndex="100"
        borderRadius="50%"
        boxShadow="0 0 0 2px white"
      >
        {icon}
      </Box>
    </Box>
  );
}
