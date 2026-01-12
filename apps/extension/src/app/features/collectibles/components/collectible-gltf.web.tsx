import { useMemo, useState } from 'react';

import { Iframe } from '@app/ui/components/iframe';

import { CollectibleCard } from './collectible-card.web';
import { CollectibleImage } from './collectible-image.web';
import { ImageUnavailable } from './image-unavailable.web';

interface CollectibleGltfProps {
  src: string;
  thumbnailSrc?: string;
  height?: number;
  onPress?(): void;
}

function buildViewerHtml(src: string) {
  const encodedSrc = JSON.stringify(src);
  return `<!DOCTYPE html>
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
</html>`;
}

function createGltfDataUrl(html: string): string {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

/**
 * Renders GLTF 3D model content using a sandboxed iframe.
 *
 * SECURITY: Uses the sandboxed Iframe component to prevent access to parent context.
 * The iframe loads Google's model-viewer library from unpkg to render 3D models.
 */
export function CollectibleGltf({
  src,
  thumbnailSrc,
  height = 200,
  onPress,
}: CollectibleGltfProps) {
  const [hasError, setHasError] = useState(false);

  const dataUrl = useMemo(() => {
    const html = buildViewerHtml(src);
    return createGltfDataUrl(html);
  }, [src]);

  if (!src || hasError) {
    return <ImageUnavailable height={height} />;
  }

  // When pressable, show thumbnail/image instead of 3D viewer
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
      <Iframe src={dataUrl} height={height} width="100%" onError={() => setHasError(true)} />
    </CollectibleCard>
  );
}
