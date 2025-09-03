import { useEffect, useState } from 'react';
import WebView from 'react-native-webview';

// fetchInscriptionTextContent is a simple axios get
// maybe its better to use axios directly in UI?
// better yet would be to add the text content to the collectible object
// in the service and then we can use that here
// i tried that but it was not working as expected
import { fetchInscriptionTextContent } from '@leather.io/query';

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
        const response = await fetchInscriptionTextContent(src);
        setContent(response);
      } catch {
        setContent('Content not found');
      }
    }

    void fetchContent();
  }, [src]);

  if (!content) return null;

  if (content.includes('<html')) {
    // remove any script tags
    const sanitizedHtml = content.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );

    // If the content is HTML, render it directly in a WebView by passing the HTML string as the source.
    return (
      <WebView
        originWhitelist={['*']}
        source={{ html: sanitizedHtml }}
        javaScriptEnabled={false}
        domStorageEnabled={false}
        startInLoadingState={false}
        scalesPageToFit={false}
      />
    );
  }

  return (
    <CollectibleCardLayout bg="ink.text-primary" p="4" width={size} height={size}>
      <Text color="ink.background-secondary" variant="code">
        {content}
      </Text>
    </CollectibleCardLayout>
  );
}
