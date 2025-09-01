import { useEffect, useState } from 'react';

import { InscriptionAsset } from '@leather.io/models';
import { Inscription as InscriptionComponent } from '@leather.io/ui/native';

import { FallbackImage } from './fallback';

interface InscriptionProps {
  item: InscriptionAsset;
  height: number;
}
export function Inscription({ item: { src, mimeType, title }, height }: InscriptionProps) {
  if (!src || src.trim() === '') return <FallbackImage />;
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
          setContent('Content not found');
        } finally {
          setIsLoading(false);
        }
      }
      void fetchContent();
    }
  }, [mimeType, src]);

  return (
    <InscriptionComponent
      name={title}
      mimeType={mimeType}
      height={height}
      src={isLoading ? '' : content || src}
    />
  );
}
