import { useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, styled } from 'leather-styles/jsx';

import { CryptoAssetProtocols } from '@leather.io/models';
import {
  type SerializedCryptoAssetId,
  assertUnreachable,
  deserializeAssetId,
} from '@leather.io/utils';

import { urlPathToAssetId } from '@app/common/asset-url';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { BitcoinTokenDetails } from './bitcoin-token-details';
import { CollectibleDetails } from './collectible-details';
import { RuneTokenDetails } from './rune-token-details';
import { Sip10TokenDetails } from './sip10-token-details';
import { StacksTokenDetails } from './stacks-token-details';

export function TokenDetails() {
  const { '*': assetPath } = useParams();

  const { assetId, parsedAssetId } = useMemo(() => {
    if (!assetPath) return { assetId: null, parsedAssetId: null };
    try {
      const serialized = urlPathToAssetId(assetPath);
      return { assetId: serialized, parsedAssetId: deserializeAssetId(serialized) };
    } catch {
      return { assetId: null, parsedAssetId: null };
    }
  }, [assetPath]);

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
