import { WebView } from 'react-native-webview';

import { CollectiblesCardLayout } from './collectible-card-layout';

interface CollectibleHtmlProps {
  src: string;
}

export function CollectibleHtml({ src }: CollectibleHtmlProps) {
  return (
    <CollectiblesCardLayout>
      <WebView source={{ uri: src }} style={{ overflow: 'hidden' }} />
    </CollectiblesCardLayout>
  );
}
