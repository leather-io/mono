import { useParams } from 'react-router';

import { parseTokenDetailsAssetId } from '@leather.io/features';
import {
  type AccountAddresses,
  type CryptoAssetProtocol,
  CryptoAssetProtocols,
} from '@leather.io/models';
import {
  type SerializedCryptoAssetId,
  assertUnreachable,
  deserializeAssetId,
} from '@leather.io/utils';

import { useTokenDetailsTracking } from '@app/common/app-analytics';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { BitcoinTokenDetails } from './bitcoin-token-details';
import { RuneTokenDetails } from './rune-token-details';
import { Sip10TokenDetails } from './sip10-token-details';
import { StacksTokenDetails } from './stacks-token-details';
import { TokenDetailsError } from './token-details-error';

interface TokenDetailsContentProps {
  assetId: SerializedCryptoAssetId;
  protocol: CryptoAssetProtocol;
  accountIndex: number;
  account: AccountAddresses;
}

function TokenDetailsContent({
  assetId,
  protocol,
  accountIndex,
  account,
}: TokenDetailsContentProps) {
  useTokenDetailsTracking({ accountIndex, assetId, protocol });

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

export function TokenDetails() {
  const { '*': encodedAssetId } = useParams();
  const assetId = parseTokenDetailsAssetId(encodedAssetId);

  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);

  if (!assetId) {
    return <TokenDetailsError />;
  }

  const { protocol } = deserializeAssetId(assetId);

  return (
    <TokenDetailsContent
      assetId={assetId}
      protocol={protocol}
      accountIndex={accountIndex}
      account={account}
    />
  );
}
