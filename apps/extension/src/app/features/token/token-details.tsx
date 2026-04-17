import { useParams } from 'react-router';

import { parseTokenDetailsAssetId } from '@leather.io/features';
import { CryptoAssetProtocols } from '@leather.io/models';
import { assertUnreachable, deserializeAssetId } from '@leather.io/utils';

import { useFlags } from '@app/features/feature-flags';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountId } from '@app/store/accounts/account';

import { BitcoinTokenDetails } from './bitcoin-token-details';
import { CollectibleDetails } from './collectible-details';
import { Sip10TokenDetails } from './sip10-token-details';
import { StacksTokenDetails } from './stacks-token-details';
import { TokenDetailsError } from './token-details-error';

export function TokenDetails() {
  const { '*': encodedAssetId } = useParams();
  const assetId = parseTokenDetailsAssetId(encodedAssetId);

  const { isOrdinalsActive } = useFlags();
  const accountId = useCurrentAccountId();
  const account = useAccountAddresses(accountId);

  if (!assetId) {
    return <TokenDetailsError />;
  }

  const { protocol } = deserializeAssetId(assetId);

  switch (protocol) {
    case CryptoAssetProtocols.nativeBtc:
      return <BitcoinTokenDetails accountId={accountId} account={account} />;
    case CryptoAssetProtocols.nativeStx:
      return <StacksTokenDetails accountId={accountId} account={account} />;
    case CryptoAssetProtocols.sip10:
      return <Sip10TokenDetails accountId={accountId} account={account} assetId={assetId} />;
    case CryptoAssetProtocols.sip9:
      return <CollectibleDetails account={account} assetId={assetId} protocol={protocol} />;
    case CryptoAssetProtocols.inscription:
      if (!isOrdinalsActive) return <TokenDetailsError />;
      return <CollectibleDetails account={account} assetId={assetId} protocol={protocol} />;
    default:
      assertUnreachable(protocol);
      return <TokenDetailsError />;
  }
}
