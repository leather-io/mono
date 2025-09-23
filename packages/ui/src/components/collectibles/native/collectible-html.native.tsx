import { WebView } from 'react-native-webview';

import { CollectibleCard } from './collectible-card.native';

interface CollectibleHtmlProps {
  src: string;
  height?: number;
  onPress?: () => void;
}
export function CollectibleHtml({ src, height = 200, onPress }: CollectibleHtmlProps) {
  return (
    <CollectibleCard height={height} onPress={onPress}>
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
      />
    </CollectibleCard>
  );
}
