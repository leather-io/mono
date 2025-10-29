import { WebView } from 'react-native-webview';

import { Box, Text, TouchableOpacity } from '../../../../native';
import { HeadsetIcon } from '../../../icons/headset-icon.native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleAudioProps {
  src: string;
  alt: string;
  size?: number;
  onPress?: () => void;
}

export function CollectibleAudio({ src, alt, size = 200, onPress }: CollectibleAudioProps) {
  return (
    <CollectibleCard>
      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.95} // Slight feedback on press
        >
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
        <WebView
          source={{ uri: src }}
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
