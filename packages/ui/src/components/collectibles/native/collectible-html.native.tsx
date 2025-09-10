import { WebView } from 'react-native-webview';

import { CollectibleCardLayout } from './collectible-card-layout.native';

interface CollectibleHtmlProps {
  src: string;
  height?: number;
}

export function CollectibleHtml({ src, height = 200 }: CollectibleHtmlProps) {
  return (
    <CollectibleCardLayout height={height}>
      <WebView source={{ uri: src }} scrollEnabled={false} />
    </CollectibleCardLayout>
  );
}
