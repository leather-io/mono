import { WebView } from 'react-native-webview';

import { HeadsetIcon } from '../../../icons/headset-icon.native';
import { Box, Text, TouchableOpacity } from '../../../native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleAudioProps {
  src: string;
  alt: string;
  size?: number;
  onPress?(): void;
}

export function CollectibleAudio({ src, alt, size = 200, onPress }: CollectibleAudioProps) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            width: 100%;
            height: ${size}px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe src="${src}" allow="autoplay"></iframe>
      </body>
    </html>
  `;

  return (
    <CollectibleCard>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
          <Box
            height={size}
            bg="ink.background-secondary"
            justifyContent="center"
            alignItems="center"
          >
            <HeadsetIcon height={36} width={36} />
            <Text textAlign="center">{alt}</Text>
          </Box>
        </TouchableOpacity>
      ) : (
        <Box height={size} width="100%">
          <WebView
            source={{ html }}
            style={{ height: size, width: '100%' }}
            scrollEnabled={false}
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            cacheEnabled={true}
            sharedCookiesEnabled={true}
          />
        </Box>
      )}
    </CollectibleCard>
  );
}
