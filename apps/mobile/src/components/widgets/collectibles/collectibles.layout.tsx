import { NonFungibleCryptoAssetInfo } from '@leather.io/models';
import { Box, CollectibleCard } from '@leather.io/ui/native';

import { serializeCollectibles } from './collectibles-serializer';

interface CollectiblesLayoutProps {
  collectibles: NonFungibleCryptoAssetInfo[];
  mode?: 'widget' | 'gallery';
}

export function CollectiblesLayout({ collectibles, mode = 'gallery' }: CollectiblesLayoutProps) {
  const displayLimit = 9;
  const thumbnailSize = mode === 'widget' ? 200 : 164;
  const processedCollectibles = serializeCollectibles(collectibles);
  return (
    <Box flexDirection="row" alignItems="center" paddingHorizontal="5" gap="4" flexWrap="wrap">
      {processedCollectibles.map(({ name, type, mimeType, subtitle, src }, index) => {
        if (mode === 'widget' && index >= displayLimit) return null;
        return (
          <CollectibleCard
            key={index}
            name={name}
            type={type}
            mimeType={mimeType}
            mode={mode}
            size={thumbnailSize}
            src={src}
            subtitle={subtitle}
          />
        );
      })}
    </Box>
  );
}
