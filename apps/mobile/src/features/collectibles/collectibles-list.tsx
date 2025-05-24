import { useCallback } from 'react';

import { FetchState } from '@/components/loading';
import { serializeCollectibles } from '@/features/collectibles';

import { NonFungibleCryptoAssetInfo } from '@leather.io/models';
import { CollectibleCard } from '@leather.io/ui/native';

interface CollectiblesListProps {
  collectibles: FetchState<NonFungibleCryptoAssetInfo[]>;
  mode: 'widget' | 'gallery';
}
export function CollectiblesList({ collectibles, mode }: CollectiblesListProps) {
  const displayLimit = mode === 'widget' ? 9 : undefined;
  const thumbnailSize = mode === 'widget' ? 200 : 164;
  const collectiblesList = useCallback(
    (collectibles: FetchState<NonFungibleCryptoAssetInfo[]>) => {
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
