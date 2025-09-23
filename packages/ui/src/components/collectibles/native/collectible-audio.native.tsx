import { HeadsetIcon } from '../../../icons/headset-icon.native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleAudioProps {
  size?: number;
  onPress?: () => void;
}

export function CollectibleAudio({ size = 200, onPress }: CollectibleAudioProps) {
  return (
    <CollectibleCard height={size} onPress={onPress}>
      <HeadsetIcon height={36} width={36} />
    </CollectibleCard>
  );
}
