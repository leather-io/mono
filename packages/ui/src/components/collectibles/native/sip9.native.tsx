import { assertUnreachable } from '@leather.io/utils';

// import { CollectibleHtml } from './collectible-html.native';
import { CollectibleImage } from './collectible-image.native';
import { CollectibleVideo } from './collectible-video.native';

export interface Sip9Props {
  contentType: 'image/png' | 'image/jpeg' | 'video/mp4' | '';
  name: string;
  height: number;
  src: string;
  onPress?: () => void;
}

export function Sip9({ contentType, name, height = 200, src, onPress }: Sip9Props) {
  console.log('Sip9', contentType, src);
  switch (contentType) {
    case 'video/mp4':
      return <CollectibleVideo src={src} height={height} />;
    case 'image/png':
    case 'image/jpeg':
    case '':
      return <CollectibleImage source={src} alt={name} height={height} onPress={onPress} />;
    default:
      assertUnreachable(contentType);
  }
}
