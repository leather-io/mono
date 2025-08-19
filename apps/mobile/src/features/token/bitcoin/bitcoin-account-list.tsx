import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { Account } from '@/store/accounts/accounts';
import { WalletStore } from '@/store/wallets/utils';

import { CryptoAssetProtocols } from '@leather.io/models';

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
  const { value } = useBtcAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;
  if (!availableBalance || !quoteBalance) {
    // TODO LEA-3015: add better loading state
    return null;
  }
  return (
    <TokenDetailsAccountListItem
      account={account}
      assetProtocol={CryptoAssetProtocols.nativeBtc}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      tokenId="BTC"
      wallet={wallet}
    />
  );
}
