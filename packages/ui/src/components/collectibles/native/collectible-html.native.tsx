import { WebView } from 'react-native-webview';

import { Box, TouchableOpacity } from '../../../../native';
import { CollectibleCard } from './collectible-card.native';
import { Image } from 'expo-image';

interface CollectibleHtmlProps {
  src: string;
  height?: number;
  onPress?: () => void;
  contentType?: string;
}

//  spending a lot of time on this. it seems like most flashlist generated webviews are not working. 
// they seem to be working on collectible details pages though
// some work and others not and I don't really understand why. 
// in this branch a lot of BNS images are not working either which I don't understand why either.




// need to get off this soon. Get details updates done then assess what else isn't working
export function CollectibleHtml({ src, height = 200, onPress, contentType }: CollectibleHtmlProps) {
  console.log('CollectibleHtml src', src, height, onPress, contentType);
  return (
    <CollectibleCard height={height}>
      {onPress ? (
        <Box position="relative" height={height}>
          {/* <CollectibleImage source={src} alt="HTML" height={height} onPress={onPress} />
           */}

           {/* // PETE this should be uri:source based on contentType */}
           <Image
        // source={{ uri: source }} 
        source={src}
        // alt={alt}
        style={{
          height: height,
          width: '100%',
        }}
        // contentFit="cover"
        // recyclingKey={src}
        // contentFit="contain"
        // cachePolicy="memory-disk" // Critical for SVGs
        // placeholder={null} // Prevents blank flash
        // transition={0} // Disable transitions in lists
      />
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
        <Box position="relative" height="100%" width="100%" overflow="hidden">
          <WebView
            source={{ uri: src }}
            // style={{ flex: 1, height: heigh, display: 'f/
            scrollEnabled={false}
            originWhitelist={['*']}
            mixedContentMode="always"
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            startInLoadingState={true}
            cacheEnabled={false}
            incognito={true}
            scalesPageToFit={false}
          />
        </Box>
      )}
    </CollectibleCard>
  );
}


// PETE - good progress here with ordinal / audio 
// next up fix the gallet view thumnails for other types 

// thjink I got it switching between src:uri and src:source based on contentType

//  check the audio one and how I was showing the old preview for audio
