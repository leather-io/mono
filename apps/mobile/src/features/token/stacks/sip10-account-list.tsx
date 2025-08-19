import { useSip10BalanceByAssetId } from '@/queries/balance/sip10-balance.query';
import { Account } from '@/store/accounts/accounts';
import { WalletStore } from '@/store/wallets/utils';

import { CryptoAssetProtocols } from '@leather.io/models';

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
      account={account}
      assetProtocol={CryptoAssetProtocols.sip10}
      availableBalance={data.value.crypto.availableBalance}
      quoteBalance={data.value.quote.totalBalance}
      tokenId={tokenId}
      wallet={wallet}
    />
  );
}
