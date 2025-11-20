import StacksNftBns from '@assets/images/stacks-nft-bns.png';

import { StxAvatarIcon } from '@leather.io/ui';

import { CollectibleItemLayoutLegacy } from '../../../../components/collectibles/collectible-item.layout-legacy';

export function StacksBnsName(props: { bnsName: string }) {
  const { bnsName } = props;

  return (
    <CollectibleItemLayoutLegacy
      collectibleTypeIcon={<StxAvatarIcon size="lg" />}
      subtitle="Bitcoin Naming System"
      title={bnsName}
    >
      <img alt="nft image" src={StacksNftBns} width="100px" />
    </CollectibleItemLayoutLegacy>
  );
}
