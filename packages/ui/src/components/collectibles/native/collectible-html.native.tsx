import { WebView } from 'react-native-webview';

import { CollectibleCard } from './collectible-card.native';

interface CollectibleHtmlProps {
  src: string;
  height?: number;
}
export function CollectibleHtml({ src, height = 200 }: CollectibleHtmlProps) {
  return (
    <CollectibleCard height={height}>
      <WebView
        source={{ uri: src }}
        scrollEnabled={false}
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState={true}
        cacheEnabled={false}
        incognito={true}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error:', nativeEvent.description);
        }}
        onHttpError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error:', nativeEvent.statusCode, nativeEvent.description);
        }}
      />
    </CollectibleCard>
  );
}
