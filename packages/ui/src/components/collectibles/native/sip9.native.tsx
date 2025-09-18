import { useEffect, useState } from 'react';

import { assertUnreachable } from '@leather.io/utils';

import { BnsImage } from './bns.native';
// import { CollectibleHtml } from './collectible-html.native';
import { CollectibleImage } from './collectible-image.native';
import { VideoThumbnailItem } from './video/collectible-video-thumbnail.native';
import { CollectibleVideo } from './video/collectible-video.native';

export interface Sip9Props {
  collection: {
    id: string;
    name: string;
    isVerified: boolean;
    locationUrl: string;
    totalItems: number;
    floorPriceAmount: {
      amount: number;
      unit: string;
    };
  };
  contentType: 'image/png' | 'image/jpeg' | 'video/mp4' | '';
  name: string;
  height: number;
  src: string;
  onPress?: () => void;
  viewType: 'thumbnail' | 'full';
}

function isBns(name: string): boolean {
  return name === 'BNS: Bitcoin Name System' || name === 'BNS: Bitcoin Name System (V2)';
}

function handleVideoContent(
  src: string,
  onPress: () => void,
  viewType: 'thumbnail' | 'full'
): React.ReactNode {
  if (viewType === 'thumbnail') {
    return <VideoThumbnailItem video={{ url: src }} onPress={onPress as any} />;
  } else {
    return <CollectibleVideo videoUrl={src} thumbnailUrl={src} />;
  }
}

// TODO - refactor this to trim down and only return the necessary fields - isImage basically
async function checkContentType(url: string) {
  try {
    // Use HEAD request to get just headers without downloading the file
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        Range: 'bytes=0-0', // Some IPFS gateways prefer range requests
      },
    });

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    return {
      contentType,
      contentLength,
      isVideo: contentType?.startsWith('video/'),
      isImage:
        contentType?.startsWith('image/') || contentType?.includes('application/octet-stream'),
      isAudio: contentType?.startsWith('audio/'),
    };
  } catch (error) {
    // Fallback: try to determine from URL extension
    const extension = url.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

    return {
      contentType: null,
      isVideo: videoExtensions.includes(extension ?? ''),
      isImage: imageExtensions.includes(extension ?? ''),
    };
  }
}

export function Sip9({
  collection,
  contentType,
  name,
  height = 200,
  src,
  onPress,
  viewType,
}: Sip9Props) {
  const [mediaInfo, setMediaInfo] = useState<{
    contentType: string | null;
    contentLength: string | null;
    isVideo: boolean | undefined;
    isImage: boolean | undefined;
    isAudio: boolean | undefined;
    error?: string | undefined;
  } | null>(null);

  useEffect(() => {
    if (contentType !== '') {
      return;
    }
    const checkMedia = async () => {
      const info = await checkContentType(src);
      // Ensure all required fields are present for setMediaInfo
      setMediaInfo({
        contentType: info.contentType ?? null,
        contentLength: info.contentLength ?? null,
        isVideo: info.isVideo,
        isImage: info.isImage,
        isAudio: info.isAudio,
        error: (info as any).error,
      });
    };

    checkMedia();
  }, [src, contentType]);
  if (isBns(collection.name)) {
    return <BnsImage alt={name} height={height} />;
  }
  switch (contentType) {
    case 'video/mp4':
      return handleVideoContent(src, onPress as any, viewType);
    case 'image/png':
    case 'image/jpeg':
      return <CollectibleImage source={src} alt={name} height={height} onPress={onPress} />;
    case '':
      // content type is empty, so we need to check if it's a video or an image
      if (mediaInfo?.isImage) {
        return <CollectibleImage source={src} alt={name} height={height} onPress={onPress} />;
      } else {
        // if it's not an image, it's probably a video
        // some of the videos return 'text/plain' as their type
        return handleVideoContent(src, onPress as any, viewType);
      }
    default:
      assertUnreachable(contentType);
  }
}
