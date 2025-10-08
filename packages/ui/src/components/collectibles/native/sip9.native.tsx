import { useEffect, useState } from 'react';

import { Sip9Asset, SupportedSip9ContentType } from '@leather.io/models';

import { CollectibleAudio } from './collectible-audio.native';
import { CollectibleHtml } from './collectible-html.native';
import { CollectibleImage } from './collectible-image.native';
import { CollectibleVideo } from './collectible-video.native';

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

    const contentType = response.headers.get('content-type') as SupportedSip9ContentType;

    return {
      contentType: contentType,
      isVideo: contentType?.startsWith('video/'),
      isImage:
        contentType?.startsWith('image/') || contentType?.includes('application/octet-stream'),
      isAudio: contentType?.startsWith('audio/'),
    };
  } catch {
    // Fallback: try to determine from URL extension
    const extension = url.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const audioExtensions = ['mp3', 'wav', 'ogg'];

    return {
      contentType: '',
      isVideo: videoExtensions.includes(extension ?? ''),
      isImage: imageExtensions.includes(extension ?? ''),
      isAudio: audioExtensions.includes(extension ?? ''),
    };
  }
}

interface MediaInfo {
  contentType: SupportedSip9ContentType;
  isVideo: boolean;
  isImage: boolean;
  isAudio: boolean;
}

export function Sip9({
  item: {
    providerData: {
      contentType,
      details: { name, cachedImage },
    },
  },
  height = 200,
  onPress,
}: Sip9Props) {
  const [mediaInfo, setMediaInfo] = useState<MediaInfo>({
    contentType: '',
    isVideo: false,
    isImage: false,
    isAudio: false,
  });
  const encodedSrc = encodeURI(cachedImage);

  useEffect(() => {
    if (contentType !== '') {
      return;
    }
    async function checkMedia() {
      const info = await checkContentType(cachedImage);
      const { contentType, isVideo, isImage, isAudio } = info;
      setMediaInfo({
        contentType: contentType,
        isVideo: isVideo,
        isImage: isImage,
        isAudio: isAudio,
      });
    }

    void checkMedia();
  }, [cachedImage, contentType]);

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
    case '':
      // content type is empty, so we need to check if it's a video or an image
      if (mediaInfo?.isImage) {
        return (
          <CollectibleImage source={encodedSrc} alt={name} height={height} onPress={onPress} />
        );
      } else {
        // if it's not an image, it's probably a video
        // some of the videos return 'text/plain' as their type
        return <CollectibleVideo src={encodedSrc} alt={name} height={height} onPress={onPress} />;
      }
    default:
      // default to image if we can't determine the content type
      return <CollectibleImage source={encodedSrc} alt={name} height={height} onPress={onPress} />;
  }
}
