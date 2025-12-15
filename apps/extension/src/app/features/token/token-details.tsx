import { useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, styled } from 'leather-styles/jsx';

import { CryptoAssetProtocols } from '@leather.io/models';
import {
  type SerializedCryptoAssetId,
  assertUnreachable,
  deserializeAssetId,
} from '@leather.io/utils';

import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { BitcoinTokenDetails } from './bitcoin_token_details';
import { CollectibleDetails } from './collectible_details';
import { RuneTokenDetails } from './rune_token_details';
import { Sip10TokenDetails } from './sip10_token_details';
import { StacksTokenDetails } from './stacks_token_details';

export function TokenDetails() {
  const { assetId } = useParams();

  const parsedAssetId = useMemo(() => {
    if (!assetId) return null;
    return deserializeAssetId(assetId as SerializedCryptoAssetId);
  }, [assetId]);

  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);

  if (!assetId || !parsedAssetId) {
    return (
      <Box px="space.05" py="space.04">
        <styled.p textStyle="body.02">Token not found.</styled.p>
      </Box>
    );
  }

  const { protocol } = parsedAssetId;

  switch (protocol) {
    case CryptoAssetProtocols.nativeBtc:
      return <BitcoinTokenDetails accountIndex={accountIndex} account={account} />;
    case CryptoAssetProtocols.nativeStx:
      return <StacksTokenDetails accountIndex={accountIndex} account={account} />;
    case CryptoAssetProtocols.sip10:
      return (
        <Sip10TokenDetails
          accountIndex={accountIndex}
          account={account}
          assetId={assetId as SerializedCryptoAssetId}
        />
      );
    case CryptoAssetProtocols.rune:
      return (
        <RuneTokenDetails
          accountIndex={accountIndex}
          account={account}
          assetId={assetId as SerializedCryptoAssetId}
        />
      );
    case CryptoAssetProtocols.brc20:
    case CryptoAssetProtocols.src20:
    case CryptoAssetProtocols.stx20:
      return (
        <Box px="space.05" py="space.04">
          <styled.p textStyle="body.02">Unsupported asset protocol for details view.</styled.p>
        </Box>
      );
    case CryptoAssetProtocols.sip9:
    case CryptoAssetProtocols.inscription:
    case CryptoAssetProtocols.stamp:
      return (
        <CollectibleDetails
          account={account}
          assetId={assetId as SerializedCryptoAssetId}
          protocol={protocol}
        />
      );
    default:
      assertUnreachable(protocol);
      return (
        <Box px="space.05" py="space.04">
          <styled.p textStyle="body.02">Unsupported asset protocol for details view.</styled.p>
        </Box>
      );
  }
}
