import { WebView } from 'react-native-webview';

import { CollectibleCard } from './collectible-card.native';

interface CollectibleHtmlProps {
  src: string;
  height?: number;
}

export function CollectibleHtml({ src, height = 200 }: CollectibleHtmlProps) {
  return (
    <CollectibleCard height={height}>
      <WebView source={{ uri: src }} scrollEnabled={false} />
    </CollectibleCard>
  );
}
