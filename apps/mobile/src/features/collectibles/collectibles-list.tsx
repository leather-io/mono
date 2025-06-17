import { useCallback } from 'react';
import { Dimensions } from 'react-native';

import { FetchState } from '@/components/loading/fetch-state';
import { serializeCollectibles } from '@/features/collectibles/collectibles-serializer';
import { useTheme } from '@shopify/restyle';

import { NonFungibleCryptoAsset } from '@leather.io/models';
import { CollectibleCard, Theme } from '@leather.io/ui/native';

const { width } = Dimensions.get('window');
interface CollectiblesListProps {
  collectibles: FetchState<NonFungibleCryptoAsset[]>;
  mode: 'widget' | 'gallery';
}
export function CollectiblesList({ collectibles, mode }: CollectiblesListProps) {
  const displayLimit = mode === 'widget' ? 9 : undefined;
  const theme = useTheme<Theme>();
  // TODO: not a good fix, it should be automatically adjusted without this mathematics on our side.
  // Will open a ticket for this one in the future
  const edgeToEdgeThumbnailWidth = (width - 2 * theme.spacing[5] - theme.spacing[4]) / 2;
  const thumbnailSize = mode === 'widget' ? 200 : edgeToEdgeThumbnailWidth;

  const collectiblesList = useCallback(
    (collectibles: FetchState<NonFungibleCryptoAsset[]>) => {
      if (collectibles.state !== 'success') return [];
      if (mode === 'widget') {
        return serializeCollectibles(collectibles.value).slice(0, displayLimit);
      }
      return serializeCollectibles(collectibles.value);
    },
    [mode, displayLimit]
  );

  return (
    <>
      {collectiblesList(collectibles).map(({ name, type, mimeType, src }, index) => (
        <CollectibleCard
          key={index}
          name={name}
          type={type}
          mimeType={mimeType}
          size={thumbnailSize}
          src={src}
        />
      ))}
    </>
  );
}
