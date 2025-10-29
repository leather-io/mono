import { CollectibleDetailsProps } from '@/features/token/types';

import { NonFungibleCryptoAsset } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { Inscription } from './components/inscription';
import { Sip9 } from './components/sip9';
import { Stamp } from './components/stamp';

interface RenderCollectibleProps {
  item: NonFungibleCryptoAsset;
  height: number;
  onPress?: (collectibleDetails: CollectibleDetailsProps) => void;
}
export function renderCollectible({ item, height, onPress }: RenderCollectibleProps) {
  switch (item.protocol) {
    case 'stamp':
      return <Stamp item={item} height={height} onPress={onPress} />;
    case 'sip9':
      return <Sip9 item={item} height={height} onPress={onPress} />;
    case 'inscription':
      return <Inscription item={item} height={height} onPress={onPress} />;
    default:
      return assertUnreachable(item);
  }
}
