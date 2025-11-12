import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { Box, TouchableOpacity } from '../../../../native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleGltfProps {
  src: string;
  height?: number;
  onPress?: () => void;
}

function buildViewerHtml(src: string) {
  const encodedSrc = JSON.stringify(src);
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: transparent;
            overflow: hidden;
            width: 100%;
            height: 100%;
          }
          model-viewer {
            width: 100%;
            height: 100%;
            background: transparent;
          }
        </style>
      </head>
      <body>
        <model-viewer
          src=${encodedSrc}
          camera-controls
          auto-rotate
          ar
          autoplay
          exposure="1"
          interaction-prompt="when-focused"
        ></model-viewer>
      </body>
    </html>
  `;
}

export function CollectibleGltf({ src, height = 200, onPress }: CollectibleGltfProps) {
  const viewerHtml = useMemo(() => buildViewerHtml(src), [src]);

  return (
    <CollectibleCard height={height}>
      <Box position="relative" height={height}>
        <WebView
          source={{ html: viewerHtml }}
          style={StyleSheet.absoluteFill}
          originWhitelist={['*']}
          scrollEnabled={false}
          androidLayerType="hardware"
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState
          cacheEnabled={false}
          incognito
        />
        {onPress ? (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onPress}
            activeOpacity={0.95}
          />
        ) : null}
      </Box>
    </CollectibleCard>
  );
}
