import { useSip10BalanceByAssetId } from '@/queries/balance/sip10-balance.query';
import { Account } from '@/store/accounts/accounts';
import { WalletStore } from '@/store/wallets/utils';

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
  const data = useSip10BalanceByAssetId(fingerprint, accountIndex, tokenId);

  if (data.state !== 'success') {
    return null;
  }
  return (
    <TokenDetailsAccountListItem
      availableBalance={data.value.crypto.availableBalance}
      quoteBalance={data.value.quote.totalBalance}
      account={account}
      wallet={wallet}
      tokenId={tokenId}
    />
  );
}
