import { ReactNode, useState } from 'react';

import { isValidUrl } from '@shared/utils/urls';

import { CollectibleItemLayoutLegacy, CollectibleItemLayoutLegacyProps } from './collectible-item.layout-legacy';
import { ImageUnavailableLegacy } from './image-unavailable-legacy';

interface CollectibleImageProps extends Omit<CollectibleItemLayoutLegacyProps, 'children'> {
  alt?: string;
  icon: ReactNode;
  src: string;
}
export function CollectibleImageLegacy(props: CollectibleImageProps) {
  const { alt, icon, src, ...rest } = props;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [width, setWidth] = useState(0);
  const isImageAvailable = src && isValidUrl(src);

  return (
    <CollectibleItemLayoutLegacy collectibleTypeIcon={icon} {...rest}>
      {isError || !isImageAvailable ? (
        <ImageUnavailableLegacy />
      ) : (
        <img
          alt={alt}
          onError={() => setIsError(true)}
          loading="lazy"
          onLoad={event => {
            const target = event.target as HTMLImageElement;
            setWidth(target.naturalWidth);
            setIsLoading(false);
          }}
          src={src}
          style={{
            width: '100%',
            height: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            // display: 'none' breaks onLoad event firing
            opacity: isLoading ? '0' : '1',
            imageRendering: width <= 40 ? 'pixelated' : 'auto',
          }}
        />
      )}
    </CollectibleItemLayoutLegacy>
  );
}
