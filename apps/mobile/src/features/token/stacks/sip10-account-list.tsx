import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
import { Account } from '@/store/accounts/accounts';
import { WalletStore } from '@/store/wallets/utils';

import { Sip10Balance } from '@leather.io/services';

import { TokenDetailsAccountListItem } from '../components/account-list';

interface Sip10AccountListItemProps {
  account: Account;
  wallet: WalletStore;
  accountIndex: number;
  fingerprint: string;
  tokenId: string;
}
export function Sip10AccountListItem({
  account,
  wallet,
  tokenId,
  accountIndex,
  fingerprint,
}: Sip10AccountListItemProps) {
  const data = useSip10AccountBalance(fingerprint, accountIndex);
  const availableBalance = data.value?.sip10s.find(
    (token: Sip10Balance) => token.asset.symbol === tokenId
  )?.crypto.availableBalance;
  const quoteBalance = data.value?.sip10s.find(
    (token: Sip10Balance) => token.asset.symbol === tokenId
  )?.quote.totalBalance;

  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <TokenDetailsAccountListItem
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      account={account}
      wallet={wallet}
      tokenId={tokenId}
    />
  );
}
