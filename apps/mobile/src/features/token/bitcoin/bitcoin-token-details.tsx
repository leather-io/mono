import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import {
  useAccountActivityByAsset,
  useTotalActivityByAsset,
} from '@/queries/activity/account-activity.query';
import { useBtcAccountBalance, useBtcTotalBalance } from '@/queries/balance/btc-balance.query';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { t } from '@lingui/core/macro';

import { btcAsset } from '@leather.io/constants';
import { OnChainActivity } from '@leather.io/models';
import { BtcAvatarIcon } from '@leather.io/ui/native';

import { AccountList } from '../components/account-list';
import { Token } from '../token';
import { BitcoinAccountListItem } from './bitcoin-account-list';
import { BitcoinAddressList } from './bitcoin-address-list';

type BitcoinTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;

export function BitcoinTokenBalance(props: BitcoinTokenBalanceProps) {
  return <TokenBalance ticker="BTC" icon={<BtcAvatarIcon />} tokenName={t`Bitcoin`} {...props} />;
}

export function BitcoinTokenDetails() {
  const { state, value } = useBtcTotalBalance();
  const { value: activity } = useTotalActivityByAsset(btcAsset);
  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;
  if (!availableBalance || !quoteBalance) {
    return null;
  }

  return (
    <Token
      tokenId="BTC"
      asset={btcAsset}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      activity={activity as OnChainActivity[]}
    >
      <AccountList
        listItem={(account, wallet) => (
          <BitcoinAccountListItem
            account={account}
            wallet={wallet}
            accountIndex={account.accountIndex}
            fingerprint={account.fingerprint}
          />
        )}
      />
    </Token>
  );
}

interface BitcoinTokenDetailsByAccountProps {
  accountIndex: number;
  fingerprint: string;
}
export function BitcoinTokenDetailsByAccount({
  accountIndex,
  fingerprint,
}: BitcoinTokenDetailsByAccountProps) {
  const { state, value } = useBtcAccountBalance(fingerprint, accountIndex);
  const account = useAccountByIndex(fingerprint, accountIndex);
  const activity = useAccountActivityByAsset(fingerprint, accountIndex, btcAsset);
  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;
  if (!availableBalance || !quoteBalance || !account) {
    return null;
  }
  return (
    <Token
      tokenId="BTC"
      asset={btcAsset}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      activity={activity.value as OnChainActivity[]}
    >
      <BitcoinAddressList account={account} />
    </Token>
  );
}
