import { useParams } from 'react-router';

import { parseTokenDetailsAssetId } from '@leather.io/features';
import { CryptoAssetProtocols } from '@leather.io/models';
import { deserializeAssetId } from '@leather.io/utils';

import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountId } from '@app/store/accounts/account';

import { BitcoinTokenDetails } from './bitcoin-token-details';
import { CollectibleDetails } from './collectible-details';
import { PolicyBitcoinTokenDetails } from './policy-bitcoin-token-details';
import { Sip10TokenDetails } from './sip10-token-details';
import { StacksTokenDetails } from './stacks-token-details';
import { TokenDetailsError } from './token-details-error';

export function TokenDetails() {
  const { '*': encodedAssetId } = useParams();
  const assetId = parseTokenDetailsAssetId(encodedAssetId);

  const accountId = useCurrentAccountId();
  const account = useCurrentAccountAddresses();

  if (!assetId) {
    return <TokenDetailsError />;
  }

  const { protocol } = deserializeAssetId(assetId);

  switch (protocol) {
    case CryptoAssetProtocols.nativeBtc:
      return account.bitcoin?.type === 'fixedAddress' ? (
        <PolicyBitcoinTokenDetails account={account} />
      ) : (
        <BitcoinTokenDetails accountId={accountId} account={account} />
      );
    case CryptoAssetProtocols.nativeStx:
      return <StacksTokenDetails account={account} />;
    case CryptoAssetProtocols.sip10:
      return <Sip10TokenDetails account={account} assetId={assetId} />;
    case CryptoAssetProtocols.sip9:
      return <CollectibleDetails account={account} assetId={assetId} protocol={protocol} />;
    default:
      return <TokenDetailsError />;
  }
}
