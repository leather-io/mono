import { TokenDetailsProps } from '@/features/token/types';

import { NonFungibleCryptoAsset } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { Stamp } from './bitcoin/stamp';
import { Inscription } from './components/inscription';
import { Sip9 } from './stacks/sip9';

interface RenderCollectibleProps {
  item: NonFungibleCryptoAsset;
  height: number;
  onPress?: (tokenDetails: TokenDetailsProps) => void;
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
