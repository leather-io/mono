import { WebView } from 'react-native-webview';

import { CollectibleCardLayout } from './collectible-card-layout.native';

interface CollectibleHtmlProps {
  src: string;
  size?: number;
}

export function CollectibleHtml({ src, size = 200 }: CollectibleHtmlProps) {
  return (
    <CollectibleCardLayout width={size} height={size}>
      <WebView source={{ uri: src }} scrollEnabled={false} />
    </CollectibleCardLayout>
  );
}
