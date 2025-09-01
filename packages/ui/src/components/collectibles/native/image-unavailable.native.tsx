import { Text } from '../../../../native';
import { Eye1ClosedIcon } from '../../../icons/eye-1-closed-icon.native';
import { CollectibleCardLayout } from './collectible-card-layout.native';

export function ImageUnavailable() {
  return (
    <CollectibleCardLayout>
      <Eye1ClosedIcon />
      <Text>Image currently unavailable</Text>
    </CollectibleCardLayout>
  );
}
