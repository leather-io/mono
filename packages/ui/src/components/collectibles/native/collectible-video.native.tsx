import { useCallback, useEffect, useMemo, useState } from 'react';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { Image } from 'expo-image';

import { Box, CollectibleCard, Text, TouchableOpacity } from '../../../../native';
import { PaperPlaneIcon } from '../../../icons/paper-plane-icon.native';

interface CollectibleVideoProps {
  src: string;
  alt: string;
  height?: number;
  onPress?: () => void;
}

interface CaptureMessage {
  type: 'thumbnail' | 'error';
  payload?: string;
  message?: string;
}

const thumbnailCache = new Map<string, string>();

function buildThumbnailCaptureHtml(src: string) {
  const encodedSrc = JSON.stringify(src);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body, html {
            margin: 0;
            padding: 0;
            background: transparent;
            overflow: hidden;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          video {
            width: 100%; 
            height: 100%; 
            object-fit: cover;
            display: block;
          }
          canvas {
            display: none;
          }
        </style>
      </head>
      <body>
        <video id="capture-video" playsinline muted preload="metadata" crossorigin="anonymous">
          <source src=${encodedSrc} />
        </video>
        <canvas id="capture-canvas"></canvas>
        <script>
          const video = document.getElementById('capture-video');
          const canvas = document.getElementById('capture-canvas');
          const ctx = canvas.getContext('2d');

          function sendMessage(message) {
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          }

          video.addEventListener('error', () => {
            sendMessage({ type: 'error', message: 'video_load_failed' });
          });

          video.addEventListener('loadeddata', () => {
            try {
              const width = video.videoWidth || 1280;
              const height = video.videoHeight || 720;
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(video, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/png');
              sendMessage({ type: 'thumbnail', payload: dataUrl });
            } catch (error) {
              sendMessage({ type: 'error', message: error?.message || 'capture_failed' });
            }
          });

          video.load();
        </script>
      </body>
    </html>
  `;
}

export function CollectibleVideo({ src, alt, height = 200, onPress }: CollectibleVideoProps) {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(() =>
    src ? (thumbnailCache.get(src) ?? null) : null
  );
  const [shouldCapture, setShouldCaptureThumbnail] = useState<boolean>(() =>
    Boolean(src && !thumbnailCache.has(src))
  );

  useEffect(() => {
    if (!src) {
      setThumbnailUri(null);
      setShouldCaptureThumbnail(false);
      return;
    }

    const cached = thumbnailCache.get(src);
    if (cached) {
      setThumbnailUri(cached);
      setShouldCaptureThumbnail(false);
    } else {
      setThumbnailUri(null);
      setShouldCaptureThumbnail(true);
    }
  }, [src]);

  const handleCaptureMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as CaptureMessage;
        if (data.type === 'thumbnail' && data.payload) {
          thumbnailCache.set(src, data.payload);
          setThumbnailUri(data.payload);
          setShouldCaptureThumbnail(false);
        } else if (data.type === 'error') {
          setShouldCaptureThumbnail(false);
        }
      } catch {
        setShouldCaptureThumbnail(false);
      }
    },
    [src]
  );

  const playbackHtml = useMemo(() => {
    if (!src) return '';
    const encodedSrc = JSON.stringify(src);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>

          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
          }
            body, html {
             
            width: 100%;
            background: transparent; 
            display: flex; 
            justify-content: center; 
            align-items: center;
            overflow: hidden;
            max-height: 100%;
            }
            
          video { 
            width: 100%; 
            height: 100%; 
            object-fit: cover;
            display: block;
          }
          </style>
        </head>
        <body>
          <video id="video" controls playsinline webkit-playsinline muted preload="metadata"></video>
          <script>
            const video = document.getElementById('video');
            video.src = ${encodedSrc};
            video.load();
          </script>
        </body>
      </html>
    `;
  }, [src]);

  function ThumbnailPlaceholder() {
    return (
      <Box
        height={height}
        bg="ink.background-secondary"
        justifyContent="center"
        alignItems="center"
      >
        <PaperPlaneIcon />
        <Text variant="caption01" textAlign="center">
          {alt}
        </Text>
      </Box>
    );
  }

  if (onPress) {
    return (
      <CollectibleCard>
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
          <Box height={height} overflow="hidden">
            {thumbnailUri ? (
              <Image
                source={{ uri: thumbnailUri }}
                style={{ height, width: '100%' }}
                contentFit="cover"
              />
            ) : (
              <ThumbnailPlaceholder />
            )}
          </Box>
        </TouchableOpacity>
        {shouldCapture && src && (
          <WebView
            key={`${src}-capture`}
            source={{ html: buildThumbnailCaptureHtml(src) }}
            originWhitelist={['*']}
            javaScriptEnabled
            allowsInlineMediaPlayback
            mixedContentMode="always"
            mediaPlaybackRequiresUserAction={false}
            onMessage={handleCaptureMessage}
            style={{ position: 'absolute', opacity: 0, width: 1, height: 1, top: 0, left: 0 }}
          />
        )}
      </CollectibleCard>
    );
  }

  return (
    <CollectibleCard width="auto" height={height}>
      <WebView
        key={src}
        source={{ html: playbackHtml }}
        style={{ flex: 1 }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={false}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        scalesPageToFit={false}
        scrollEnabled={false}
        allowsBackForwardNavigationGestures={false}
        contentInsetAdjustmentBehavior="never"
        mixedContentMode="always"
        androidHardwareAccelerationDisabled={false}
        originWhitelist={['*']}
        onShouldStartLoadWithRequest={() => true}
      />
    </CollectibleCard>
  );
}

export default CollectibleVideo;
