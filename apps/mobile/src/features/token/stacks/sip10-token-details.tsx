import {
  useAccountActivityByAsset,
  useTotalActivityByAsset,
} from '@/queries/activity/account-activity.query';
import {
  useSip10AccountBalanceByAsset,
  useSip10TotalBalanceByAsset,
} from '@/queries/balance/sip10-balance.query';
import { useAccountByIndex } from '@/store/accounts/accounts.read';

import { CryptoAsset } from '@leather.io/models';

import { AccountList } from '../components/account-list';
import { Token } from '../token';
import { Sip10AccountListItem } from './sip10-account-list';
import { Sip10AddressList } from './sip10-address-list';

interface Sip10TokenDetailsProps {
  tokenId: string;
}
export function Sip10TokenDetails({ tokenId }: Sip10TokenDetailsProps) {
  const data = useSip10TotalBalanceByAsset(tokenId);
  const availableBalance = data.value?.crypto.availableBalance;
  const quoteBalance = data.value?.quote.totalBalance;
  const asset = data.value?.asset;
  const activity = useTotalActivityByAsset(asset as CryptoAsset);
  if (!availableBalance || !quoteBalance || !asset) {
    return null;
  }
  return (
    <Token
      tokenId={tokenId}
      asset={asset}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      canSend={false}
      activity={activity}
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
  const data = useSip10AccountBalanceByAsset(fingerprint, accountIndex, tokenId);
  const availableBalance = data.value?.crypto.availableBalance;
  const quoteBalance = data.value?.quote.totalBalance;
  const asset = data.value?.asset;
  const activity = useAccountActivityByAsset(fingerprint, accountIndex, asset as CryptoAsset);
  const account = useAccountByIndex(fingerprint, accountIndex);
  if (!account || !availableBalance || !quoteBalance || !asset) {
    return null;
  }
  return (
    <Token
      tokenId={tokenId}
      asset={asset}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      canSend={false}
      activity={activity}
    >
      <Sip10AddressList account={account} tokenId={tokenId} />
    </Token>
  );
}
