import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { Account } from '@/store/accounts/accounts';
import { WalletStore } from '@/store/wallets/utils';

import { CryptoAssetProtocols } from '@leather.io/models';

import { TokenDetailsAccountListItem } from '../components/account-list';

interface StacksAccountListItemProps {
  account: Account;
  wallet: WalletStore;
  accountIndex: number;
  fingerprint: string;
}
export function StacksAccountListItem({
  account,
  wallet,
  accountIndex,
  fingerprint,
}: StacksAccountListItemProps) {
  const { value } = useStxAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.stx.availableUnlockedBalance;
  const quoteBalance = value?.quote.availableUnlockedBalance;

  if (!availableBalance || !quoteBalance) {
    // TODO LEA-3015: add better loading state
    return null;
  }

  return (
    <TokenDetailsAccountListItem
      account={account}
      assetProtocol={CryptoAssetProtocols.nativeStx}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      tokenId="STX"
      wallet={wallet}
    />
  );
}
