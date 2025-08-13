import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { Account } from '@/store/accounts/accounts';
import { WalletStore } from '@/store/wallets/utils';

import { TokenDetailsAccountListItem } from '../components/account-list';

interface BitcoinAccountListItemProps {
  account: Account;
  wallet: WalletStore;
  accountIndex: number;
  fingerprint: string;
}
export function BitcoinAccountListItem({
  account,
  wallet,
  accountIndex,
  fingerprint,
}: BitcoinAccountListItemProps) {
  const { state, value } = useBtcAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;
  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <TokenDetailsAccountListItem
      account={account}
      wallet={wallet}
      tokenId="BTC"
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
    />
  );
}
