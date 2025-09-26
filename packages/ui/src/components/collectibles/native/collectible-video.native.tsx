import { useRef } from 'react';
import { WebView } from 'react-native-webview';

import { Box, CollectibleCard, Text, TouchableOpacity } from '../../../../native';
import { PaperPlaneIcon } from '../../../icons/paper-plane-icon.native';

interface CollectibleVideoProps {
  src: string;
  alt: string;
  height?: number;
  onPress?: () => void;
}

export function CollectibleVideo({ src, alt, height = 200, onPress }: CollectibleVideoProps) {
  const webViewRef = useRef(null);

  const videoHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
          }
          html, body { 
            width: 100%;
            height: 100%;
            background: #000; 
            display: flex; 
            justify-content: center; 
            align-items: center;
            overflow: hidden;
          }
          video { 
            width: 100%; 
            height: 100%; 
            object-fit: contain;
            max-width: 100%;
            max-height: 100%;
          }
          #error {
            color: white;
            padding: 20px;
            text-align: center;
            font-family: -apple-system, system-ui;
          }
        </style>
      </head>
      <body>
        <video 
          id="video"
          controls 
          playsinline 
          webkit-playsinline
          muted
          preload="metadata">
        </video>
        <div id="error" style="display: none;"></div>
        
        <script>
          try {
            const video = document.getElementById('video');
            const errorDiv = document.getElementById('error');            
                      
            // Set video source
            video.src = "${src}";
            
            // Try to load and play
            video.load();
            
            // Auto-play after user interaction (tap on thumbnail)
            setTimeout(() => {
              video.play().catch(e => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'debug',
                  message: 'Autoplay failed: ' + e.message
                }));
              });
            }, 100);
                    
            // iOS specific fullscreen prevention
            video.addEventListener('webkitbeginfullscreen', (e) => {
              e.preventDefault();
              video.webkitExitFullscreen();
            });
            
          } catch (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: 'Script error: ' + e.message
            }));
          }
        </script>
      </body>
    </html>
  `;

  return (
    <CollectibleCard>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
          <Box
            height={height}
            bg="ink.background-secondary"
            justifyContent="center"
            alignItems="center"
          >
            <PaperPlaneIcon />
            <Text textAlign="center">{alt}</Text>
          </Box>
        </TouchableOpacity>
      ) : (
        <Container>
          <WebView
            ref={webViewRef}
            source={{ html: videoHtml }}
            style={{ flex: 1 }}
            // Media playback settings
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo={false}
            // JavaScript settings
            javaScriptEnabled={true}
            domStorageEnabled={true}
            // Performance settings
            startInLoadingState={false}
            scalesPageToFit={false}
            scrollEnabled={false}
            // iOS specific
            allowsBackForwardNavigationGestures={false}
            contentInsetAdjustmentBehavior="never"
            // Android specific
            mixedContentMode="always"
            androidHardwareAccelerationDisabled={false}
            // Security
            originWhitelist={['*']}
            onShouldStartLoadWithRequest={() => true}
          />
        </Container>
      )}
    </CollectibleCard>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <Box width="100%" aspectRatio={16 / 9} overflow="hidden" position="relative">
      {children}
    </Box>
  );
}

export default CollectibleVideo;
