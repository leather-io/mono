import { useEffect, useState } from 'react';

import { type Sip9MediaInfo, getSip9MediaInfo } from '@leather.io/features';
import type { Sip9Asset } from '@leather.io/models';

import { CollectibleAudio } from './collectible-audio.web';
import { CollectibleGltf } from './collectible-gltf.web';
import { CollectibleImage } from './collectible-image.web';
import { CollectibleVideo } from './collectible-video.web';

interface Sip9Props {
  item: Sip9Asset;
  onPress?(): void;
}

export function Sip9({
  item: {
    content: { contentType, contentUrl },
    name,
  },
  onPress,
}: Sip9Props) {
  const [mediaInfo, setMediaInfo] = useState<Sip9MediaInfo>({
    contentType: null,
    isVideo: false,
    isImage: false,
    isAudio: false,
  });

  useEffect(() => {
    if (contentType) return;
    let cancelled = false;
    void getSip9MediaInfo(contentUrl).then(info => {
      if (!cancelled) setMediaInfo(info);
    });
    return () => {
      cancelled = true;
    };
  }, [contentType, contentUrl]);

  const image = <CollectibleImage src={contentUrl} alt={name} onPress={onPress} />;

  switch (contentType) {
    case 'video/mp4':
      return <CollectibleVideo src={contentUrl} alt={name} onPress={onPress} />;
    case 'image/png':
    case 'image/jpeg':
    case 'image/gif':
    case 'image/webp':
    case 'image/svg+xml':
    case 'image/bmp':
    case 'image/tiff':
    case 'image/avif':
    case 'application/octet-stream':
      return image;
    case 'audio/mpeg':
    case 'audio/wav':
    case 'audio/ogg':
    case 'audio/mp3':
    case 'audio/aac':
    case 'audio/flac':
    case 'audio/webm':
      return <CollectibleAudio src={contentUrl} alt={name} onPress={onPress} />;
    case 'model/gltf+json':
    case 'model/gltf-binary':
      return <CollectibleGltf src={contentUrl} onPress={onPress} />;
    case 'text/plain':
    case '':
      if (mediaInfo.isVideo) {
        return <CollectibleVideo src={contentUrl} alt={name} onPress={onPress} />;
      }
      return image;
    default:
      return image;
  }
}
