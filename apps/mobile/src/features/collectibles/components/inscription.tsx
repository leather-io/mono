import { useEffect, useState } from 'react';

import { CollectibleDetailsProps } from '@/features/token/types';
import { t } from '@lingui/core/macro';

import { InscriptionAsset } from '@leather.io/models';
import { Inscription as InscriptionComponent } from '@leather.io/ui/native';

import { FallbackImage } from './fallback';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

interface InscriptionProps {
  item: InscriptionAsset;
  height: number;
  onPress?: (collectibleDetails: CollectibleDetailsProps) => void;
}
export function Inscription({
  item,
  height,
  onPress,
}: InscriptionProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { mimeType, src, title } = item;
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
  return (
    <InscriptionComponent
      name={title}
      mimeType={mimeType}
      height={height}
      src={isLoading ? '' : content || src}
      onPress={onPress ? () => onPress({ assetId: serializeAssetId(getAssetId(item)), assetProtocol: 'inscription' }) : undefined}
    />
  );
}
