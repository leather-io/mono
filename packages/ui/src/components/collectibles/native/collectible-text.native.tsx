import { useEffect, useState } from 'react';

import { Text } from '../../text/text.native';
import { CollectibleCardLayout } from './collectible-card-layout.native';

interface CollectibleTextProps {
  src: string;
  size?: number;
}

export function CollectibleText({ src, size = 200 }: CollectibleTextProps) {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Try to parse as JSON, but fall back to text if it fails
        let data;
        try {
          data = await response.json();
          setContent(JSON.stringify(data, null, 2));
        } catch {
          // If not JSON, try as plain text
          const text = await response.text();
          setContent(text);
        }
      } catch {
        setContent('Content not found');
      }
    }

    void fetchContent();
  }, [src]);

  if (!content) return null;

  return (
    <CollectibleCardLayout bg="ink.text-primary" p="4" width={size} height={size}>
      {/* 
       TODO: assess security implications of rendering HTML content
       - XSS attacks seem unlikely on React Native 
      - I tried using RenderHtml, but it was not working as expected
      - sanitize-html is a popular library for this, but it's a little heavy for this use case
      - I tried regex's but theres always a new case to catch and it actually removes some valid content
       */}
      <Text color="ink.background-secondary" variant="code">
        {content}
      </Text>
    </CollectibleCardLayout>
  );
}
