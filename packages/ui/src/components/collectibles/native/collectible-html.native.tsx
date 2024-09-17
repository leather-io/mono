import { WebView } from 'react-native-webview';

import { CollectibleCardLayout } from './collectible-card-layout.native';

interface CollectibleHtmlProps {
  src: string;
}

export function CollectibleHtml({ src }: CollectibleHtmlProps) {
  return (
    <CollectibleCardLayout>
      <WebView source={{ uri: src }} width={200} height={200} style={{ overflow: 'hidden' }} />
    </CollectibleCardLayout>
  );
}
