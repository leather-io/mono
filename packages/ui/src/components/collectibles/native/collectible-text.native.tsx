import { useEffect, useState } from 'react';

// import { sanitize } from 'dompurify';
import { Text } from '../../../../native';
import { CollectibleCardLayout } from './collectible-card-layout.native';

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
        // eslint-disable-next-line no-empty
      } catch {}
    };

    void fetchContent();
  }, [src]);

  return (
    <CollectibleCardLayout bg="ink.text-primary" p="4">
      <Text color="ink.background-secondary" textAlign="left">
        {/* FIXME
        - implement alternative for dompurify in native
        - I tried using jsdom as a polyfill but then hit an error Can't resolve 'vm' in jsdom
        - maybe we should write our own sanitizer?
        */}
        {/* {content ? sanitize(content) : ''} */}
        {content}
      </Text>
    </CollectibleCardLayout>
  );
}
