import { WebView } from 'react-native-webview';

import { Text } from '../../../../native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleTextProps {
  src: string;
  height?: number;
}

export function CollectibleText({ src, height = 200 }: CollectibleTextProps) {
  // Check if content contains HTML tags (safe, non-polynomial regex)
  // To avoid regex DoS, only check the first 512 characters for HTML tags
  const htmlRegex = /<\w+[\s\S]*?>/;
  const preview = typeof src === 'string' ? src.slice(0, 512) : '';
  const isHtml = htmlRegex.test(preview);

  if (isHtml) {
    return (
      <CollectibleCard height={height}>
        <WebView
          source={{ html: src }}
          scrollEnabled={false}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          cacheEnabled={false}
          incognito={true}
          textZoom={Math.max(50, Math.min(100, height))}
        />
      </CollectibleCard>
    );
  }

  return (
    <CollectibleCard bg="ink.text-primary" height={height}>
      <Text color="ink.background-secondary" variant="code" p="4">
        {(() => {
          try {
            // Try to pretty-print if it's valid JSON
            const parsed = JSON.parse(src);
            return JSON.stringify(parsed, null, 2);
          } catch {
            // Fallback to raw text if not JSON
            return src;
          }
        })()}
      </Text>
    </CollectibleCard>
  );
}
