import { ReactNode, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { CollectibleCard } from './collectible-card.native';
import { CollectibleImage } from './collectible-image.native';

interface CollectibleGltfProps {
  src: string;
  thumbnailSrc?: string;
  height?: number;
  onPress?(): void;
  imageUnavailableLabel?: ReactNode;
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

export function CollectibleGltf({
  src,
  thumbnailSrc,
  height = 200,
  onPress,
  imageUnavailableLabel,
}: CollectibleGltfProps) {
  const viewerHtml = useMemo(() => buildViewerHtml(src), [src]);

  if (onPress) {
    return (
      <CollectibleImage
        alt="Collectible preview"
        src={thumbnailSrc ?? src}
        height={height}
        onPress={onPress}
        imageUnavailableLabel={imageUnavailableLabel}
      />
    );
  }

  return (
    <CollectibleCard height={height}>
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
    </CollectibleCard>
  );
}
