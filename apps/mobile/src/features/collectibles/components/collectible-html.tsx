import { ReactNode, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { Box, TouchableOpacity } from '@leather.io/ui/native';

import { CollectibleCard } from './collectible-card';
import { ImageUnavailable } from './image-unavailable';

interface CollectibleHtmlProps {
  src: string;
  height?: number;
  thumbnailSrc?: string;
  onPress?: () => void;
  imageUnavailableLabel?: ReactNode;
}

export function CollectibleHtml({
  src,
  height = 200,
  thumbnailSrc,
  onPress,
  imageUnavailableLabel,
}: CollectibleHtmlProps) {
  const [hasError, setHasError] = useState(false);
  const showFallback = hasError || !src;

  function renderFallback() {
    return (
      <Box position="relative">
        <ImageUnavailable height={height} message={imageUnavailableLabel} />
        {onPress ? (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onPress}
            activeOpacity={0.95}
          />
        ) : null}
      </Box>
    );
  }

  if (showFallback) {
    return renderFallback();
  }

  return (
    <CollectibleCard height={height}>
      <Box position="relative" height={height}>
        <WebView
          source={{ uri: thumbnailSrc ?? src }}
          style={{ flex: 1, backgroundColor: 'transparent', height, width: '100%' }}
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
