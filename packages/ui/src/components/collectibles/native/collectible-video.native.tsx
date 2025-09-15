import { useState } from 'react';
import { WebView } from 'react-native-webview';

import { Box, Text } from '../../../../native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleVideoProps {
  src: string;
  height?: number;
  width?: number;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export function CollectibleVideo({
  src,
  height = 300,
  width,
  autoPlay = false,
  loop = true,
  muted = true,
  controls = true,
}: CollectibleVideoProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.error('Video error for:', src);
    setHasError(true);
  };

  if (hasError) {
    return (
      <CollectibleCard bg="ink.background-secondary" height={height} width={width}>
        <Box flex={1} justifyContent="center" alignItems="center" p="4">
          <Text color="ink.text-subdued" textAlign="center">
            Video unavailable
          </Text>
        </Box>
      </CollectibleCard>
    );
  }

  // Create HTML5 video player
  const videoHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            background: black;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          video {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <video 
          ${controls ? 'controls' : ''}
          ${autoPlay ? 'autoplay' : ''}
          ${loop ? 'loop' : ''}
          ${muted ? 'muted' : ''}
          playsinline
          preload="metadata"
        >
          <source src="${src}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </body>
    </html>
  `;
  console.log('videoHtml', src);
  return (
    <CollectibleCard height={height} width={width}>
      <WebView
        source={{ html: videoHtml }}
        style={{ flex: 1 }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onError={handleError}
        onHttpError={handleError}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        mixedContentMode="compatibility"
      />
    </CollectibleCard>
  );
}
