import { ErrorFallbackTab } from '@/components/error/error';
import { Inscription } from '@/features/collectibles/components/inscription';
import { useAccountCollectibleByAssetId } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, InscriptionAsset } from '@leather.io/models';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenLoading } from '../components/token-loading';

interface InscriptionDetailsProps {
  account: AccountId;
  assetId: string;
}
export function InscriptionDetails({ assetId, account }: InscriptionDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const height = useCollectibleHeight();

  const collectible = useAccountCollectibleByAssetId(fingerprint, accountIndex, assetId);
  if (collectible.state === 'loading') {
    return <TokenLoading />;
  }
  if (collectible.state === 'error') {
    return <ErrorFallbackTab />;
  }
  if (collectible.state === 'success' && collectible.value.length > 0) {
    const { title } = collectible.value?.[0] as InscriptionAsset;
    return (
      <Collectible name={title} description={title}>
        <Inscription item={collectible.value[0]! as InscriptionAsset} height={height} />
      </Collectible>
    );
  }

  return <ErrorFallbackTab />;
}

// const inscription = {
//   address: 'bc1p8v40p5x64hv52lrh8w4pfq7j6sec7jrck6f7rr6qqwzuze04hwcqa60vrp',
//   category: 'nft',
//   chain: 'bitcoin',
//   genesisBlockHash: '00000000000000000001bb1a21cd65881f2cf3c1f7516aa0746733adf37acdf8',
//   genesisBlockHeight: 830737,
//   genesisTimestamp: 1708099267,
//   id: '3bd8ed6e06a46d27d94184d03c595dcd464ee3741dd725fe22b1c0ab34b63691i0',
//   mimeType: 'image',
//   name: 'inscription',
//   number: 60893257,
//   offset: '10000',
//   output: '0',
//   preview:
//     'https://ordinals.hiro.so/inscription/3bd8ed6e06a46d27d94184d03c595dcd464ee3741dd725fe22b1c0ab34b63691i0',
//   protocol: 'inscription',
//   src: 'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/3bd8ed6e06a46d27d94184d03c595dcd464ee3741dd725fe22b1c0ab34b63691i0',
//   title: 'Inscription 60893257',
//   txid: 'c18eae84e2687fd3f93a0fd4795b75b9c713f3c3fc504aec26df0ec685eb5980',
//   value: '17709',
// };
