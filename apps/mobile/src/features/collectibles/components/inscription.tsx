import { useEffect, useState } from 'react';

import { TokenDetailsProps } from '@/features/token/types';
import { t } from '@lingui/core/macro';

import { InscriptionAsset } from '@leather.io/models';
import { CollectibleImage, Inscription as InscriptionComponent } from '@leather.io/ui/native';

import { FallbackImage } from './fallback';

interface InscriptionProps {
  item: InscriptionAsset;
  height: number;
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}
export function Inscription({
  item: { id, mimeType, src, title, preview },
  height,
  onPress,
}: InscriptionProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  if (!src || src.trim() === '') return <FallbackImage />;

  const handlePress =
    onPress !== undefined ? () => onPress({ assetId: id, assetProtocol: 'inscription' }) : undefined;

  const shouldShowPreviewCard =
    Boolean(handlePress) && (mimeType === 'html' || mimeType === 'gltf') && Boolean(preview);

  if (shouldShowPreviewCard) {
    return <CollectibleImage alt={title} height={height} onPress={handlePress} source={preview} />;
  }

  return (
    <InscriptionComponent
      name={title}
      mimeType={mimeType}
      height={height}
      previewSrc={preview}
      src={isLoading ? '' : content || src}
      onPress={handlePress}
    />
  );
}
