import { CollectibleImage, type CollectibleImageProps } from './collectible-image.web';

type CollectibleSvgProps = Omit<CollectibleImageProps, 'isSvg'>;

export function CollectibleSvg(props: CollectibleSvgProps) {
  return <CollectibleImage {...props} isSvg />;
}
