import { WebView } from 'react-native-webview';

import { Box, CollectibleImage, TouchableOpacity } from '../../../../native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleHtmlProps {
  src: string;
  height?: number;
  onPress?: () => void;
}

//  spending a lot of time on this. it seems like most flashlist generated webviews are not working. 
// they seem to be working on collectible details pages though
// some work and others not and I don't really understand why. 
// in this branch a lot of BNS images are not working either which I don't understand why either.




// need to get off this soon. Get details updates done then assess what else isn't working
export function CollectibleHtml({ src, height = 200, onPress }: CollectibleHtmlProps) {
  console.log('CollectibleHtml src', src, height, onPress);
  return (
    <CollectibleCard height={height}>
      {onPress ? (
        <Box position="relative" height={height}>
          <CollectibleImage source={src} alt="HTML" height={height} onPress={onPress} />
          {/* <WebView
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
          /> */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={onPress}
            activeOpacity={0.95} // Slight feedback on press
          />
        </Box>
      ) : (
        <Box position="relative" height={height}>
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
        </Box>
      )}
    </CollectibleCard>
  );
}
