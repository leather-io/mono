import { useEffect, useState } from 'react';

import { Text } from '../../../../native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleTextProps {
  src: string;
  height?: number;
}

export function CollectibleText({ src, height = 200 }: CollectibleTextProps) {
  const [content, setContent] = useState<string | null>(null);
  // FIXME: this content should be processed in the service and let us use HTML content
  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(src);
        const textData = await response.text();
        setContent(textData);
      } catch (error) {
        setContent('Content not found');
      }
    }

    void fetchContent();
  }, [src]);

  if (!content) return null;

  return (
    <CollectibleCard bg="ink.text-primary" height={height}>
      <Text color="ink.background-secondary" variant="code" p="4">
        {content}
      </Text>
    </CollectibleCard>
  );
}
