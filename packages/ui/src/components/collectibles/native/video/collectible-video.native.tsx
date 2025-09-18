import { useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

export function CollectibleVideo({
  videoUrl,
  thumbnailUrl,
}: {
  videoUrl: string;
  thumbnailUrl: string;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
            video.src = "${videoUrl}";
            
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
                url: "${videoUrl}"
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

      switch (data.type) {
        case 'error':
          setError(data.message);
          setIsLoading(false);
          break;
        case 'canplay':
          setIsLoading(false);
          break;
        case 'ended':
          // Optionally reset to thumbnail
          // setShowVideo(false);
          break;
        case 'debug':
        default:
          break;
      }
    } catch {}
  }

  function handleWebViewError(syntheticEvent: any) {
    const { nativeEvent } = syntheticEvent;
    setError(`WebView error: ${nativeEvent.description || 'Unknown error'}` as any);
    setIsLoading(false);
  }

  if (!showVideo) {
    return (
      <TouchableOpacity
        onPress={() => {
          setShowVideo(true);
          setIsLoading(true);
          setError(null);
        }}
        style={styles.container}
        activeOpacity={0.9}
      >
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Tap to play video</Text>
          </View>
        )}
        <View style={styles.playButtonOverlay}>
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶️</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: videoHtml }}
        style={styles.video}
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
        onError={handleWebViewError}
        onLoadEnd={() => {
          // Give it a moment to initialize
          setTimeout(() => {
            if (isLoading) {
              setIsLoading(false);
            }
          }, 1000);
        }}
        // Security
        originWhitelist={['*']}
        onShouldStartLoadWithRequest={() => true}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              setShowVideo(false);
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  video: {
    flex: 1,
    backgroundColor: '#000',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  playIcon: {
    fontSize: 30,
    marginLeft: 5,
    color: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CollectibleVideo;
