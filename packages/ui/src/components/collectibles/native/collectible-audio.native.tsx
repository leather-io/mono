import { HeadsetIcon } from '../../../icons/headset-icon.native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleAudioProps {
  size?: number;
}

export function CollectibleAudio({ size = 200 }: CollectibleAudioProps) {
  return (
    <CollectibleCard height={size}>
      <HeadsetIcon height={36} width={36} />
    </CollectibleCard>
  );
}
