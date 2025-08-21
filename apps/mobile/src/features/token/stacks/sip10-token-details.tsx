import { useSip10ActivityByAssetId } from '@/queries/activity/sip10-activity.query';
import { useSip10BalanceByAssetId } from '@/queries/balance/sip10-balance.query';
import { Account } from '@/store/accounts/accounts';

import { Token } from '../token';
import { Sip10AddressList } from './sip10-address-list';

interface Sip10TokenDetailsProps {
  account: Account;
  assetId: string;
}
export function Sip10TokenDetails({ assetId, account }: Sip10TokenDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const balance = useSip10BalanceByAssetId(fingerprint, accountIndex, assetId);
  const activity = useSip10ActivityByAssetId(fingerprint, accountIndex, assetId);
  if (balance.state !== 'success') {
    // TODO LEA-3015: add better loading state
    return null;
  }
  return (
    <Token
      tokenId={balance.value.asset.symbol}
      asset={balance.value.asset}
      availableBalance={balance.value.crypto.availableBalance}
      quoteBalance={balance.value.quote.totalBalance}
      canSend={false}
      activity={activity.value ?? []}
    >
      <Sip10AddressList account={account} assetId={assetId} />
    </Token>
  );
}
