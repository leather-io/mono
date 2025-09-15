import { useEffect, useState } from 'react';

import { Text } from '../../../../native';
import { Pressable } from '../../pressable/pressable.native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleTextProps {
  src: string;
  height?: number;
  onPress?: () => void; // Add optional onPress prop
}

export function CollectibleText({ src, height = 200, onPress }: CollectibleTextProps) {
  const [content, setContent] = useState<string | null>(null);
  // FIXME: this content should be processed in the service and let us use HTML content
  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(src);
        const textData = await response.text();
        setContent(textData);
      } catch {
        setContent('Content not found');
      }
    }

    void fetchContent();
  }, [src]);

  if (!content) return null;

  const cardContent = (
    <CollectibleCard bg="ink.text-primary" height={height}>
      <Text color="ink.background-secondary" variant="code" p="4">
        {content}
      </Text>
    </CollectibleCard>
  );

  // If onPress is provided, wrap with Pressable
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        haptics="light" // Light haptic feedback on press
        pressEffects={{ opacity: { from: 1, to: 0.8 } }} // Slight opacity change
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}
