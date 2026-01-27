import { WebView } from 'react-native-webview';

import { Pressable, Text } from '@leather.io/ui/native';

import { CollectibleCard } from './collectible-card';

interface CollectibleTextProps {
  src: string;
  height?: number;
  onPress?(): void;
}

export function CollectibleText({ src, height = 200, onPress }: CollectibleTextProps) {
  // Check if content contains HTML tags (safe, non-polynomial regex)
  // To avoid regex DoS, only check the first 512 characters for HTML tags
  const htmlRegex = /<\w+[\s\S]*?>/;
  const preview = typeof src === 'string' ? src.slice(0, 512) : '';
  const isHtml = htmlRegex.test(preview);

  const content = isHtml ? (
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
  ) : (
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

  if (onPress) {
    return (
      <Pressable onPress={onPress} haptics="light" pressEffect={{ opacity: { from: 1, to: 0.8 } }}>
        {content}
      </Pressable>
    );
  }

  return content;
}
