import { useEffect, useState } from 'react';

import { Sip9Asset } from '@leather.io/models';

import { CollectibleAudio } from './collectible-audio.native';
import { CollectibleHtml } from './collectible-html.native';
import { CollectibleImage } from './collectible-image.native';
import { CollectibleVideo } from './collectible-video.native';

const supportedContentTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'image/avif',
  'video/mp4',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
  'audio/webm',
  'text/plain',
  'application/octet-stream',
  'model/gltf+json',
  'model/gltf-binary',
  '',
] as const;

export type SupportedSip9ContentType = (typeof supportedContentTypes)[number];

const supportedContentTypesSet = new Set(supportedContentTypes);

function isSupportedContentType(
  contentType: string | null
): contentType is SupportedSip9ContentType {
  if (contentType === null) return false;
  return supportedContentTypesSet.has(contentType as SupportedSip9ContentType);
}

export interface Sip9Props {
  item: Sip9Asset;
  height: number;
  onPress?: () => void;
}

async function checkContentType(url: string): Promise<MediaInfo> {
  try {
    // Use HEAD request to get just headers without downloading the file
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        Range: 'bytes=0-0', // Some IPFS gateways prefer range requests
      },
    });

    const rawContentType = response.headers.get('content-type');
    const contentType = isSupportedContentType(rawContentType) ? rawContentType : '';
    const isVideo = rawContentType?.startsWith('video/') ?? false;
    const isImage =
      (rawContentType?.startsWith('image/') ?? false) || rawContentType === 'application/octet-stream';
    const isAudio = rawContentType?.startsWith('audio/') ?? false;
    const isHtml = rawContentType?.startsWith('model/gltf') ?? false;

    return {
      contentType,
      isVideo,
      isImage,
      isAudio,
      isHtml,
    };
  } catch {
    // Fallback: try to determine from URL extension
    const extension = url.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const audioExtensions = ['mp3', 'wav', 'ogg'];
    const htmlExtensions = ['gltf', 'glb'];

    const isVideo = videoExtensions.includes(extension ?? '');
    const isImage = imageExtensions.includes(extension ?? '');
    const isAudio = audioExtensions.includes(extension ?? '');
    const isHtml = htmlExtensions.includes(extension ?? '');

    return {
      contentType: isHtml ? 'model/gltf+json' : '',
      isVideo,
      isImage,
      isAudio,
      isHtml,
    };
  }
}

interface MediaInfo {
  contentType: SupportedSip9ContentType;
  isVideo: boolean;
  isImage: boolean;
  isAudio: boolean;
  isHtml: boolean;
}

export function Sip9({
  item: {
    content: { contentType, contentUrl },
    name,
  },
  height = 200,
  onPress,
}: Sip9Props) {
  const [mediaInfo, setMediaInfo] = useState<MediaInfo>({
    contentType: '',
    isVideo: false,
    isImage: false,
    isAudio: false,
    isHtml: false,
  });
  const encodedSrc = encodeURI(contentUrl);

  useEffect(() => {
    const needsDetection =
      contentType === '' ||
      contentType === null ||
      contentType === undefined ||
      contentType === 'text/plain' ||
      contentType === 'application/octet-stream';

    if (!needsDetection) {
      return;
    }
    async function checkMedia() {
      const info = await checkContentType(contentUrl);
      const { contentType, isVideo, isImage, isAudio, isHtml } = info;
      setMediaInfo({
        contentType: contentType,
        isVideo: isVideo,
        isImage: isImage,
        isAudio: isAudio,
        isHtml,
      });
    }

    void checkMedia();
  }, [contentUrl, contentType]);

  switch (contentType) {
    case 'video/mp4':
      return <CollectibleVideo src={encodedSrc} alt={name} height={height} onPress={onPress} />;
    case 'image/png':
    case 'image/jpeg':
    case 'image/gif':
    case 'image/webp':
    case 'image/svg+xml':
    case 'image/bmp':
    case 'image/tiff':
    case 'image/avif':
    case 'application/octet-stream':
      return <CollectibleImage source={encodedSrc} alt={name} height={height} onPress={onPress} />;
    case 'audio/mpeg':
    case 'audio/wav':
    case 'audio/ogg':
    case 'audio/mp3':
    case 'audio/aac':
    case 'audio/flac':
    case 'audio/webm':
      return <CollectibleAudio src={encodedSrc} alt={name} size={height} onPress={onPress} />;
    case 'model/gltf+json':
    case 'model/gltf-binary':
      return <CollectibleHtml src={encodedSrc} height={height} onPress={onPress} />;
    case 'text/plain':
      if (mediaInfo.isHtml) {
        return <CollectibleHtml src={encodedSrc} height={height} onPress={onPress} />;
      }
      if (mediaInfo.isVideo) {
        return <CollectibleVideo src={encodedSrc} alt={name} height={height} onPress={onPress} />;
      }
      if (mediaInfo.isAudio) {
        return <CollectibleAudio src={encodedSrc} alt={name} size={height} onPress={onPress} />;
      }
      if (mediaInfo.isImage) {
        return (
          <CollectibleImage source={encodedSrc} alt={name} height={height} onPress={onPress} />
        );
      }
      return <CollectibleImage source={encodedSrc} alt={name} height={height} onPress={onPress} />;
    case '':
      // content type is empty, so we need to check if it's a video or an image
      if (mediaInfo.isHtml) {
        return <CollectibleHtml src={encodedSrc} height={height} onPress={onPress} />;
      }
      if (mediaInfo.isVideo) {
        return <CollectibleVideo src={encodedSrc} alt={name} height={height} onPress={onPress} />;
      }
      if (mediaInfo.isAudio) {
        return <CollectibleAudio src={encodedSrc} alt={name} size={height} onPress={onPress} />;
      }
      if (mediaInfo.isImage) {
        return (
          <CollectibleImage source={encodedSrc} alt={name} height={height} onPress={onPress} />
        );
      }
      return <CollectibleImage source={encodedSrc} alt={name} height={height} onPress={onPress} />;
    default:
      if (contentType.startsWith('video/')) {
        return <CollectibleVideo src={encodedSrc} alt={name} height={height} onPress={onPress} />;
      }
      if (contentType.startsWith('audio/')) {
        return <CollectibleAudio src={encodedSrc} alt={name} size={height} onPress={onPress} />;
      }
      if (contentType.startsWith('model/gltf')) {
        return <CollectibleHtml src={encodedSrc} height={height} onPress={onPress} />;
      }
      // default to image if we can't determine the content type
      return <CollectibleImage source={encodedSrc} alt={name} height={height} onPress={onPress} />;
  }
}
