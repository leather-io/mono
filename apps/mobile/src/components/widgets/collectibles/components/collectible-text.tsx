// FIXME: Lifted from extension
// // TODO: migrate `collectible-type` components to monorepo
// FIXME when using real data sanitization is needed
// import { sanitize } from 'dompurify';
import { useEffect, useState } from 'react';

import { Text } from '@leather.io/ui/native';

import { CollectiblesCardLayout } from './collectible-card-layout';

interface CollectibleTextProps {
  src: string;
}

export function CollectibleText({ src }: CollectibleTextProps) {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setContent(JSON.stringify(data, null, 2));
      } catch (err) {
        // eslint-disable-next-line no-console, lingui/no-unlocalized-strings
        console.log('Error fetching content:', err);
      }
    };

    void fetchContent();
  }, [src]);

  return (
    <CollectiblesCardLayout bg="ink.text-primary" p="4">
      <Text color="ink.background-secondary" textAlign="left">
        {/* FIXME when using real data sanitization is needed  */}
        {/* {sanitize(children)} */}
        {content}
      </Text>
    </CollectiblesCardLayout>
  );
}
