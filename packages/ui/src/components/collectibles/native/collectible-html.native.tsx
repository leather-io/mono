import { StyleSheet } from 'react-native';
import { useState } from 'react';
import { WebView } from 'react-native-webview';

import { Box, TouchableOpacity } from '../../../../native';
import { CollectibleCard } from './collectible-card.native';
import { CollectibleImage } from './collectible-image.native';
import { ImageUnavailable } from './image-unavailable.native';

interface CollectibleHtmlProps {
  src: string;
  thumbnailSrc?: string;
  height?: number;
  onPress?: () => void;
}

export function CollectibleHtml({
  src,
  thumbnailSrc,
  height = 200,
  onPress,
}: CollectibleHtmlProps) {
  const [hasError, setHasError] = useState(false);
  const showFallback = hasError || !src;

  function renderFallback() {
    if (thumbnailSrc) {
      return (
        <CollectibleImage
          alt="Collectible preview"
          source={thumbnailSrc}
          height={height}
          onPress={onPress}
        />
      );
    }
    return (
      <Box position="relative">
        <ImageUnavailable height={height} />
        {onPress ? (
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onPress} activeOpacity={0.95} />
        ) : null}
      </Box>
    );
  };

  if (showFallback) {
    return renderFallback();
  }

  return (
    <CollectibleCard height={height}>
      <Box position="relative" height={height}>
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
          bounces={false}
          overScrollMode="never"
          pointerEvents="none"
          onError={() => setHasError(true)}
          onHttpError={() => setHasError(true)}
        />
        {onPress ? (
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={onPress}
            activeOpacity={0.95}
          />
        ) : null}
      </Box>
    </CollectibleCard>
  );
}
