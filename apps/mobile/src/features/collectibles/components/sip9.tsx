import { useEffect, useState } from 'react';

import { type Sip9MediaInfo, getSip9MediaInfo } from '@leather.io/features';
import { Sip9Asset } from '@leather.io/models';

import { CollectibleAudio } from './collectible-audio';
import { CollectibleGltf } from './collectible-gltf';
import { CollectibleImage } from './collectible-image';
import { CollectibleVideo } from './collectible-video';

export interface Sip9Props {
  item: Sip9Asset;
  height?: number;
  onPress?: () => void;
}

export function Sip9({
  item: {
    content: { contentType, contentUrl },
    name,
  },
  height = 200,
  onPress,
}: Sip9Props) {
  const [mediaInfo, setMediaInfo] = useState<Sip9MediaInfo>({
    contentType: '',
    isVideo: false,
    isImage: false,
    isAudio: false,
  });
  const encodedSrc = encodeURI(contentUrl);

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

  function renderImage() {
    return <CollectibleImage src={encodedSrc} alt={name} height={height} onPress={onPress} />;
  }

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
      return renderImage();
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
      return <CollectibleGltf src={encodedSrc} height={height} onPress={onPress} />;
    case 'text/plain':
    case '':
      if (mediaInfo.isVideo) {
        return <CollectibleVideo src={encodedSrc} alt={name} height={height} onPress={onPress} />;
      }
      return renderImage();
    default:
      return renderImage();
  }
}
