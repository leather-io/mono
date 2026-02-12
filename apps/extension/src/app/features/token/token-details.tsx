import { useParams } from 'react-router';

import { urlPathToAssetId } from '@leather.io/features';
import { CryptoAssetProtocols } from '@leather.io/models';
import { assertUnreachable, deserializeAssetId } from '@leather.io/utils';

import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { BitcoinTokenDetails } from './bitcoin-token-details';
import { RuneTokenDetails } from './rune-token-details';
import { Sip10TokenDetails } from './sip10-token-details';
import { StacksTokenDetails } from './stacks-token-details';
import { TokenDetailsError } from './token-details-error';

function safeParseAssetId(assetPath: string | undefined) {
  if (!assetPath) return null;
  try {
    const assetId = urlPathToAssetId(assetPath);
    return { assetId, parsedAssetId: deserializeAssetId(assetId) };
  } catch {
    return null;
  }
}

export function TokenDetails() {
  const { '*': assetPath } = useParams();
  const parsed = safeParseAssetId(assetPath);

  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);

  if (!parsed) {
    return <TokenDetailsError />;
  }

  const { assetId, parsedAssetId } = parsed;
  const { protocol } = parsedAssetId;

  switch (protocol) {
    case CryptoAssetProtocols.nativeBtc:
      return <BitcoinTokenDetails accountIndex={accountIndex} account={account} />;
    case CryptoAssetProtocols.nativeStx:
      return <StacksTokenDetails accountIndex={accountIndex} account={account} />;
    case CryptoAssetProtocols.sip10:
      return <Sip10TokenDetails accountIndex={accountIndex} account={account} assetId={assetId} />;
    case CryptoAssetProtocols.rune:
      return <RuneTokenDetails accountIndex={accountIndex} account={account} assetId={assetId} />;
    case CryptoAssetProtocols.brc20:
    case CryptoAssetProtocols.src20:
    case CryptoAssetProtocols.sip9:
    case CryptoAssetProtocols.inscription:
    case CryptoAssetProtocols.stamp:
      return <TokenDetailsError />;
    default:
      assertUnreachable(protocol);
      return <TokenDetailsError />;
  }
}
