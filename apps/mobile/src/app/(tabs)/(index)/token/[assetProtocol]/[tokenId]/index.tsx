import { BitcoinTokenDetails } from '@/features/token/bitcoin/bitcoin-token-details';
import { Sip10TokenDetails } from '@/features/token/stacks/sip10-token-details';
import { StacksTokenDetails } from '@/features/token/stacks/stacks-token-details';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { CryptoAssetProtocols } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

export const configureTokenParamsSchema = z.object({
  assetProtocol: z.string(),
  tokenId: z.string(),
});

export default function TokenScreen() {
  const params = useLocalSearchParams();
  const { assetProtocol, tokenId } = configureTokenParamsSchema.parse(params);

  switch (assetProtocol) {
    case CryptoAssetProtocols.nativeBtc:
      return <BitcoinTokenDetails />;
    case CryptoAssetProtocols.nativeStx:
      return <StacksTokenDetails />;
    case CryptoAssetProtocols.sip10:
      return <Sip10TokenDetails tokenId={tokenId} />;
    default:
      assertUnreachable(assetProtocol as never);
  }
}
