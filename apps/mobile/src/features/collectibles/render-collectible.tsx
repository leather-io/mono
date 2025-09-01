import { NonFungibleCryptoAsset } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { Inscription } from './components/inscription';
import { Sip9 } from './components/sip9';
import { Stamp } from './components/stamp';

interface RenderCollectibleProps {
  item: NonFungibleCryptoAsset;
  height: number;
}
export function renderCollectible({ item, height }: RenderCollectibleProps) {
  switch (item.protocol) {
    case 'stamp':
      return <Stamp item={item} height={height} />;
    case 'sip9':
      return <Sip9 item={item} height={height} />;
    case 'inscription':
      return <Inscription item={item} height={height} />;
    default:
      return assertUnreachable(item);
  }
}
