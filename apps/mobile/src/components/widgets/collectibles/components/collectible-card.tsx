import React from 'react';

import { t } from '@lingui/macro';

import { type Collectible } from '../collectibles.mocks';
import { CollectibleHtml } from './collectible-html';
import { CollectibleImage } from './collectible-image';
import { CollectibleText } from './collectible-text';

interface CollectiblesCardProps {
  collectible: Collectible;
}

export function CollectiblesCard({ collectible }: CollectiblesCardProps) {
  const isOrdinal = 'name' in collectible;

  const imageSource = isOrdinal ? collectible.src : collectible.metadata.cached_thumbnail_image;

  if (isOrdinal) {
    switch (collectible.mimeType) {
      case 'text':
        return <CollectibleText src={collectible.src} />;
      case 'html':
        return <CollectibleHtml src={collectible.src} />;
      // Add more cases for other mimeTypes as needed
    }
  }

  return (
    <CollectibleImage
      source={imageSource}
      alt={(isOrdinal ? String(collectible.name) : collectible.metadata.name) || t`Collectible`}
    />
  );
}
