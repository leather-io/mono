import { useEffect, useState } from 'react';

import { TokenDetailsProps } from '@/features/token/types';
import { getImageUnavailableLabel } from '@/features/token/utils/image-unavailable-label';
import { t } from '@lingui/core/macro';

import { InscriptionAsset } from '@leather.io/models';
import { ImageUnavailable, Inscription as InscriptionComponent } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

interface InscriptionProps {
  item: InscriptionAsset;
  height: number;
  onPress?(tokenDetails: TokenDetailsProps): void;
}
export function Inscription({ item, height, onPress }: InscriptionProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { mimeType, src, title, thumbnailSrc } = item;
  // Only fetch content if it's needed for text type and not already provided
  useEffect(() => {
    if (mimeType === 'text' && src) {
      setIsLoading(true);
      async function fetchContent() {
        try {
          const response = await fetch(src);
          const textData = await response.text();
          setContent(textData);
        } catch {
          setContent(t`Content not found`);
        } finally {
          setIsLoading(false);
        }
      }
      void fetchContent();
    }
  }, [mimeType, src]);

  if (!src || src.trim() === '') {
    return <ImageUnavailable height={height} message={getImageUnavailableLabel()} />;
  }
  return (
    <InscriptionComponent
      name={title}
      mimeType={mimeType}
      height={height}
      src={isLoading ? '' : content || src}
      thumbnailSrc={thumbnailSrc}
      imageUnavailableLabel={getImageUnavailableLabel()}
      onPress={onPress ? () => onPress({ assetId: serializeAssetId(getAssetId(item)) }) : undefined}
    />
  );
}
