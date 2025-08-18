import {
  useSip10ActivityByAssetId,
  useSip10TotalActivityByAssetId,
} from '@/queries/activity/sip10-activity.query';
import {
  useSip10BalanceByAssetId,
  useSip10TotalBalanceByAssetId,
} from '@/queries/balance/sip10-balance.query';
import { useAccountByIndex } from '@/store/accounts/accounts.read';

import { AccountList } from '../components/account-list';
import { Token } from '../token';
import { Sip10AccountListItem } from './sip10-account-list';
import { Sip10AddressList } from './sip10-address-list';

interface Sip10TokenDetailsProps {
  tokenId: string;
}
export function Sip10TokenDetails({ tokenId }: Sip10TokenDetailsProps) {
  const balance = useSip10TotalBalanceByAssetId(tokenId);
  const activity = useSip10TotalActivityByAssetId(tokenId);
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
      <AccountList
        listItem={(account, wallet) => (
          <Sip10AccountListItem
            account={account}
            wallet={wallet}
            accountIndex={account.accountIndex}
            fingerprint={account.fingerprint}
            tokenId={tokenId}
          />
        )}
      />
    </Token>
  );
}

interface Sip10TokenDetailsByAccountProps {
  accountIndex: number;
  fingerprint: string;
  tokenId: string;
}
export function Sip10TokenDetailsByAccount({
  tokenId,
  accountIndex,
  fingerprint,
}: Sip10TokenDetailsByAccountProps) {
  const balance = useSip10BalanceByAssetId(fingerprint, accountIndex, tokenId);
  const activity = useSip10ActivityByAssetId(fingerprint, accountIndex, tokenId);
  const account = useAccountByIndex(fingerprint, accountIndex);
  if (!account || balance.state !== 'success') {
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
      <Sip10AddressList account={account} tokenId={tokenId} />
    </Token>
  );
}
