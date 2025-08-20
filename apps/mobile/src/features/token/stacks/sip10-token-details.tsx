import { useSip10ActivityByAssetId } from '@/queries/activity/sip10-activity.query';
import { useSip10BalanceByAssetId } from '@/queries/balance/sip10-balance.query';
import { Account } from '@/store/accounts/accounts';

import { Token } from '../token';
import { Sip10AddressList } from './sip10-address-list';

interface Sip10TokenDetailsByAccountProps {
  account: Account;
  assetId: string;
}
export function Sip10TokenDetailsByAccount({ assetId, account }: Sip10TokenDetailsByAccountProps) {
  const { fingerprint, accountIndex } = account;
  const balance = useSip10BalanceByAssetId(fingerprint, accountIndex, assetId);
  const activity = useSip10ActivityByAssetId(fingerprint, accountIndex, assetId);
  if (balance.state !== 'success') {
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
