import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Image } from 'expo-image';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { Box, CollectibleCard, Text, TouchableOpacity } from '../../../../native';
import { PaperPlaneIcon } from '../../../icons/paper-plane-icon.native';

interface CollectibleVideoProps {
  src: string;
  alt: string;
  height?: number;
  onPress?: () => void;
  previewSrc?: string | null;
}

interface CaptureMessage {
  type: 'thumbnail' | 'error';
  payload?: string;
  message?: string;
}

const thumbnailCache = new Map<string, string>();

function buildCaptureHtml(src: string) {
  const encodedSrc = JSON.stringify(src);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body, html {
            margin: 0;
            padding: 0;
            background: transparent;
            overflow: hidden;
            width: 100%;
            height: 100%;
          }
          video, canvas {
            position: fixed;
            top: -10000px;
            left: -10000px;
            width: 1px;
            height: 1px;
            visibility: hidden;
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

function Container({ children, height }: { children: ReactNode; height: number }) {
  return (
    <Box width="100%" height={height} overflow="hidden" position="relative">
      {children}
    </Box>
  );
}

export function CollectibleVideo({
  src,
  alt,
  height = 200,
  onPress,
  previewSrc = null,
}: CollectibleVideoProps) {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(() => {
    if (!src) return null;
    return thumbnailCache.get(src) ?? previewSrc ?? null;
  });
  const [shouldCapture, setShouldCapture] = useState<boolean>(() =>
    Boolean(src && !thumbnailCache.has(src) && !previewSrc)
  );
  const [captureError, setCaptureError] = useState<string | null>(null);
  const contentFit = onPress ? 'cover' : 'contain';

  useEffect(() => {
    if (!src) {
      setThumbnailUri(null);
      setShouldCapture(false);
      setCaptureError(null);
      return;
    }

    const cached = thumbnailCache.get(src);
    if (cached) {
      setThumbnailUri(cached);
      setShouldCapture(false);
      setCaptureError(null);
    } else if (previewSrc) {
      setThumbnailUri(previewSrc);
      setShouldCapture(false);
      setCaptureError(null);
    } else {
      setThumbnailUri(null);
      setShouldCapture(true);
      setCaptureError(null);
    }
  }, [previewSrc, src]);

  const handleCaptureMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as CaptureMessage;
        if (data.type === 'thumbnail' && data.payload) {
          thumbnailCache.set(src, data.payload);
          setThumbnailUri(data.payload);
          setCaptureError(null);
          setShouldCapture(false);
        } else if (data.type === 'error') {
          setCaptureError(data.message ?? 'Failed to capture thumbnail');
          setShouldCapture(false);
        }
      } catch (error) {
        setCaptureError((error as Error).message ?? 'Failed to capture thumbnail');
        setShouldCapture(false);
      }
    },
    [src]
  );

  const captureView =
    shouldCapture && src ? (
      <WebView
        key={`${src}-capture`}
        source={{ html: buildCaptureHtml(src) }}
        originWhitelist={['*']}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mixedContentMode="always"
        mediaPlaybackRequiresUserAction={false}
        onMessage={handleCaptureMessage}
        onError={() => {
          setCaptureError('Failed to capture thumbnail');
          setShouldCapture(false);
        }}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1, top: 0, left: 0 }}
      />
    ) : null;

  const posterAttribute = useMemo(
    () => (thumbnailUri ? ` poster="${thumbnailUri}"` : ''),
    [thumbnailUri]
  );

  const playbackHtml = useMemo(() => {
    if (!src) return '';
    const encodedSrc = JSON.stringify(src);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body, html {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background: #000;
              overflow: hidden;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            video {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <video id="video"${posterAttribute} controls playsinline webkit-playsinline muted preload="metadata"></video>
          <script>
            const video = document.getElementById('video');
            video.src = ${encodedSrc};
            video.load();
          </script>
        </body>
      </html>
    `;
  }, [posterAttribute, src]);

  function renderPlaceholder() {
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
              <>
                <Image
                  source={{ uri: thumbnailUri }}
                  style={{ height, width: '100%' }}
                  contentFit={contentFit}
                  recyclingKey={thumbnailUri}
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  justifyContent="flex-end"
                  alignItems="flex-start"
                  pointerEvents="none"
                  p="2"
                >
                  <Box bg="ink.background-primary" opacity={0.85} borderRadius="md" px="3" py="1">
                    <Text variant="caption01">View video</Text>
                  </Box>
                </Box>
              </>
            ) : (
              renderPlaceholder()
            )}
          </Box>
        </TouchableOpacity>
        {captureView}
      </CollectibleCard>
    );
  }

  return (
    <CollectibleCard>
      <Container height={height}>
        {thumbnailUri ? (
          <Image
            source={{ uri: thumbnailUri }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            contentFit={contentFit}
            recyclingKey={thumbnailUri}
          />
        ) : null}
        {!thumbnailUri && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            justifyContent="center"
            alignItems="center"
            bg="ink.background-secondary"
            pointerEvents="none"
          >
            <PaperPlaneIcon />
            <Text variant="caption01" textAlign="center">
              {captureError ?? alt}
            </Text>
          </Box>
        )}
        {src ? (
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
        ) : (
          renderPlaceholder()
        )}
      </Container>
      {captureView}
    </CollectibleCard>
  );
}

export default CollectibleVideo;
