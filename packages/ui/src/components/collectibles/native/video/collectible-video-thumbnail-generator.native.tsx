import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

function VideoThumbnailGenerator({
  videoUrl,
  onThumbnailGenerated,
  timestamp = 1,
}: {
  videoUrl: string;
  onThumbnailGenerated: (thumbnailData: string) => void;
  timestamp: number;
}) {
  const [isGenerating, setIsGenerating] = useState(true);
  const encodedVideoUrl = encodeURI(videoUrl);

  const thumbnailGeneratorHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; }
          video { display: none; }
          canvas { display: none; }
        </style>
      </head>
      <body>
        <video 
          id="video" 
          preload="metadata"
          crossorigin="anonymous"
          muted
          playsinline>
        </video>
        <canvas id="canvas"></canvas>
        
        <script>
          const video = document.getElementById('video');
          const canvas = document.getElementById('canvas');
          const ctx = canvas.getContext('2d');
          
          video.src = "${encodedVideoUrl}";
          
          video.addEventListener('loadedmetadata', () => {
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Seek to desired timestamp
            video.currentTime = ${timestamp};
          });
          
          video.addEventListener('seeked', () => {
            try {
              // Draw video frame to canvas
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Convert to base64
              canvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'thumbnail',
                    data: reader.result,
                    width: video.videoWidth,
                    height: video.videoHeight
                  }));
                };
                reader.readAsDataURL(blob);
              }, 'image/jpeg', 0.8);
            } catch (e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: e.message
              }));
            }
          });
          
          video.addEventListener('error', (e) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: 'Failed to load video'
            }));
          });
        </script>
      </body>
    </html>
  `;

  function handleMessage(event: any) {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'thumbnail') {
        onThumbnailGenerated(data.data);
        setIsGenerating(false);
      } else if (data.type === 'error') {
        onThumbnailGenerated(null as any);
        setIsGenerating(false);
      }
    } catch {
      // Silently ignore JSON parsing errors for invalid messages
    }
  }

  if (!isGenerating) return null;

  return (
    <View style={styles.hidden}>
      <WebView
        source={{ html: thumbnailGeneratorHtml }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    left: -1000,
  },
  webview: {
    width: 1,
    height: 1,
  },
});

export default VideoThumbnailGenerator;
