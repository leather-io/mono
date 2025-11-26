import { ReactNode, useState } from 'react';

import { Iframe } from '@app/ui/components/iframe';

import { CollectibleItemLayoutLegacy, CollectibleItemLayoutLegacyProps } from './collectible-item.layout-legacy';
import { ImageUnavailableLegacy } from './image-unavailable-legacy';

interface CollectibleIframeProps extends Omit<CollectibleItemLayoutLegacyProps, 'children'> {
  icon: ReactNode;
  src: string;
}
export function CollectibleIframeLegacy({ icon, src, ...props }: CollectibleIframeProps) {
  const [isError, setIsError] = useState(false);

  if (isError)
    return (
      <CollectibleItemLayoutLegacy collectibleTypeIcon={icon} {...props}>
        <ImageUnavailableLegacy />
      </CollectibleItemLayoutLegacy>
    );

  return (
    <CollectibleItemLayoutLegacy collectibleTypeIcon={icon} {...props}>
      <Iframe
        aspectRatio="1 / 1"
        height="100%"
        objectFit="cover"
        onError={() => setIsError(true)}
        src={src}
        width="100%"
        zIndex={99}
        tabIndex={-1}
      />
    </CollectibleItemLayoutLegacy>
  );
}
