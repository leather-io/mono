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
            
            // Debug logging
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'debug',
              message: 'HTML loaded, setting video source'
            }));
            
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
            
            // Event listeners
            video.addEventListener('loadstart', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'loadstart'
              }));
            });
            
            video.addEventListener('canplay', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'canplay'
              }));
            });
            
            video.addEventListener('play', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'play'
              }));
            });
            
            video.addEventListener('pause', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'pause'
              }));
            });
            
            video.addEventListener('ended', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ended'
              }));
            });
            
            video.addEventListener('error', (e) => {
              const error = video.error;
              let errorMessage = 'Unknown error';
              
              if (error) {
                switch(error.code) {
                  case 1: errorMessage = 'Aborted'; break;
                  case 2: errorMessage = 'Network error'; break;
                  case 3: errorMessage = 'Decode error'; break;
                  case 4: errorMessage = 'Source not supported'; break;
                }
              }
              
              errorDiv.textContent = 'Error loading video: ' + errorMessage;
              errorDiv.style.display = 'block';
              video.style.display = 'none';
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: errorMessage,
                url: "${src}"
              }));
            });
            
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

  function handleMessage(event: any) {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // switch (data.type) {
      //   case 'error':
      //     setError(data.message);
      //     setIsLoading(false);
      //     break;
      //   case 'canplay':
      //     setIsLoading(false);
      //     break;
      //   case 'ended':
      //     // Optionally reset to thumbnail
      //     // setShowVideo(false);
      //     break;
      //   case 'debug':
      //   default:
      //     break;
      // }
    } catch {
      // Silently ignore JSON parsing errors for invalid messages
    }
  }

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
            // Event handlers
            onMessage={handleMessage}
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
