import { useState } from 'react';
import { WebView } from 'react-native-webview';

import { Box, TouchableOpacity } from '../../../../native';
import { CollectibleCard } from './collectible-card.native';
import { ImageUnavailable } from './image-unavailable.native';

interface CollectibleHtmlProps {
  src: string;
  height?: number;
  onPress?: () => void;
}
export function CollectibleHtml({ src, height = 200, onPress }: CollectibleHtmlProps) {
  const [hasError, setHasError] = useState(false);
  const showFallback = hasError || !src;

  return (
    <CollectibleCard height={height}>
      {onPress ? (
        <Box position="relative" height={height}>
          {showFallback ? (
            <ImageUnavailable height={height} />
          ) : (
            <WebView
              source={{ uri: src }}
              style={{ flex: 1, backgroundColor: 'transparent' }}
              scrollEnabled={false}
              originWhitelist={['*']}
              mixedContentMode="always"
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              startInLoadingState={true}
              cacheEnabled={false}
              incognito={true}
              bounces={false} // iOS
              overScrollMode="never" // Android
              pointerEvents="none"
              onError={() => setHasError(true)}
              onHttpError={() => setHasError(true)}
            />
          )}
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={onPress}
            activeOpacity={0.95} // Slight feedback on press
          />
        </Box>
      ) : (
        <>
          {showFallback ? (
            <ImageUnavailable height={height} />
          ) : (
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
              onError={() => setHasError(true)}
              onHttpError={() => setHasError(true)}
            />
          )}
        </>
      )}
    </CollectibleCard>
  );
}
