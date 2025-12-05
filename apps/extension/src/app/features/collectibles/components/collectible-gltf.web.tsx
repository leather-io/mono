import { useMemo } from 'react';

import { CollectibleCard } from './collectible-card.web';
import { CollectibleImage } from './collectible-image.web';
import { ImageUnavailable } from './image-unavailable.web';

interface CollectibleGltfProps {
  src: string;
  thumbnailSrc?: string;
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

export function CollectibleGltf({
  src,
  thumbnailSrc,
  height = 200,
  onPress,
}: CollectibleGltfProps) {
  const viewerHtml = useMemo(() => buildViewerHtml(src), [src]);

  if (!src) {
    return <ImageUnavailable height={height} />;
  }

  if (onPress) {
    return (
      <CollectibleImage
        alt="Collectible preview"
        src={thumbnailSrc ?? src}
        height={height}
        onPress={onPress}
      />
    );
  }

  return (
    <CollectibleCard height={height}>
      <iframe
        srcDoc={viewerHtml}
        height={height}
        width="100%"
        style={{ border: 'none' }}
        allow="xr-spatial-tracking"
        allowFullScreen
      />
    </CollectibleCard>
  );
}

