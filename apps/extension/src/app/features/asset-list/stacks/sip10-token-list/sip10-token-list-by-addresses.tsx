import { Stack } from 'leather-styles/jsx';

import type { AccountAddresses } from '@leather.io/models';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { useSip10AccountBalanceByAddresses } from '@app/query/stacks/sip10/sip10-balance.hooks';

import type { AssetRightElementVariant } from '../../token-list';
import { Sip10TokenItem } from './sip10-token-item';

interface Sip10TokenAssetListByAddressesProps {
  account: AccountAddresses;
  assetRightElementVariant?: AssetRightElementVariant;
  onSelectAsset?(assetId: SerializedCryptoAssetId): void;
}

export function Sip10TokenAssetListByAddresses({
  account,
  onSelectAsset,
  assetRightElementVariant,
}: Sip10TokenAssetListByAddressesProps) {
  const sip10s = useSip10AccountBalanceByAddresses(account);

  if (sip10s.state !== 'success' && !sip10s.value) return null;

  return (
    <Stack>
      {sip10s.value.sip10s.map(sip10 => (
        <Sip10TokenItem
          key={sip10.asset.assetId}
          assetRightElementVariant={assetRightElementVariant}
          balance={sip10}
          isEnabled={true}
          onSelectAsset={onSelectAsset}
        />
      ))}
    </Stack>
  );
}
