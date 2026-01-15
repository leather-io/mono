import { useEffect, useState } from 'react';

import { type Sip9MediaInfo, getSip9MediaInfo } from '@leather.io/features';
import type { Sip9Asset } from '@leather.io/models';

import { CollectibleAudio } from './collectible-audio';
import { CollectibleGltf } from './collectible-gltf';
import { CollectibleImage } from './collectible-image';
import { CollectibleVideo } from './collectible-video';

interface Sip9Props {
  item: Sip9Asset;
  height?: number;
  onPress?(): void;
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
      if (!cancelled) {
        setMediaInfo(info);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [contentType, contentUrl]);

  const resolvedContentType = contentType || mediaInfo.contentType;
  const isVideo = mediaInfo.isVideo;
  const isImage = mediaInfo.isImage;
  const isAudio = mediaInfo.isAudio;
  const isGltf = resolvedContentType === 'model/gltf-binary';

  if (isVideo) {
    return <CollectibleVideo src={encodedSrc} alt={name} height={height} onPress={onPress} />;
  }

  if (isImage) {
    return <CollectibleImage src={encodedSrc} alt={name} height={height} onPress={onPress} />;
  }

  if (isAudio) {
    return <CollectibleAudio src={encodedSrc} name={name} height={height} onPress={onPress} />;
  }

  if (isGltf) {
    return <CollectibleGltf src={encodedSrc} name={name} height={height} onPress={onPress} />;
  }

  return null;
}
