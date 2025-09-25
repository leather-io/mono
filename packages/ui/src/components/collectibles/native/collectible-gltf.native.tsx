import { WebView } from 'react-native-webview';

import { Box, TouchableOpacity } from '../../../../native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleGltfProps {
  src: string;
  height?: number;
  onPress?: () => void;
}
export function CollectibleGltf({ src, height = 200, onPress }: CollectibleGltfProps) {
  console.log('onPress', onPress);
  return (
    <CollectibleCard height={height}>
      {/* On the thumbnail page we need TouchableOpacity to be able to press the card */}
      {onPress ? (
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
            bounces={false} // iOS
            overScrollMode="never" // Android
            pointerEvents="none"
          />
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={onPress}
            activeOpacity={0.95} // Slight feedback on press
          />
        </Box>
      ) : (
        <WebView
          source={{ uri: src }}
          scrollEnabled={false}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          cacheEnabled={false}
          incognito={true}
        />
      )}
    </CollectibleCard>
  );
}
