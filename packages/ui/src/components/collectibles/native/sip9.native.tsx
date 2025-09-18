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
  };
  contentType: 'image/png' | 'image/jpeg' | 'video/mp4' | '';
  name: string;
  height: number;
  src: string;
  onPress?: () => void;
  viewType: 'thumbnail' | 'full';
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
  if (
    collection?.name === 'BNS: Bitcoin Name System' ||
    collection?.name === 'BNS: Bitcoin Name System (V2)'
  ) {
    return <BnsImage alt={name} height={height} />;
  }
  switch (contentType) {
    case 'video/mp4':
    case '':
      if (viewType === 'thumbnail') {
        return <VideoThumbnailItem video={{ url: src }} onPress={onPress as any} />;
      } else {
        return <CollectibleVideo videoUrl={src} thumbnailUrl={src} />;
      }
    // return <CollectibleVideo videoUrl={src} thumbnailUrl={src} />;
    case 'image/png':
    case 'image/jpeg':
      return <CollectibleImage source={src} alt={name} height={height} onPress={onPress} />;
    default:
      assertUnreachable(contentType);
  }
}
