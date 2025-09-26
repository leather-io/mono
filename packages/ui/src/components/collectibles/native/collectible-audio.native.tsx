import { WebView } from 'react-native-webview';

import { Box, TouchableOpacity } from '../../../../native';
import { HeadsetIcon } from '../../../icons/headset-icon.native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleAudioProps {
  src: string;
  size?: number;
  onPress?: () => void;
}

export function CollectibleAudio({ src, size = 200, onPress }: CollectibleAudioProps) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          audio {
            width: 100%;
            max-width: 400px;
          }
        </style>
      </head>
      <body>
        <audio controls preload="metadata">
          <source src="${src}" type="audio/mpeg">
          <source src="${src}" type="audio/wav">
          <source src="${src}" type="audio/ogg">
          Your browser does not support the audio element.
        </audio>
      </body>
    </html>
  `;
  return (
    <CollectibleCard height={size}>
      {onPress ? (
        <Box position="relative" height={size} justifyContent="center" alignItems="center">
          <HeadsetIcon height={36} width={36} />
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={onPress}
            activeOpacity={0.95} // Slight feedback on press
          />
        </Box>
      ) : (
        <WebView
          source={{ html: htmlContent }}
          style={{ flex: 1 }}
          scrollEnabled={false}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          cacheEnabled={false}
          incognito={true}
          preload="none"
        />
      )}
    </CollectibleCard>
  );
}
