import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useAccountActivityByAsset } from '@/queries/activity/account-activity.query';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { Account } from '@/store/accounts/accounts';
import { t } from '@lingui/core/macro';

import { btcAsset } from '@leather.io/constants';
import { BtcAvatarIcon } from '@leather.io/ui/native';

import { Token } from '../token';
import { BitcoinAddressList } from './bitcoin-address-list';

type BitcoinTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;

export function BitcoinTokenBalance(props: BitcoinTokenBalanceProps) {
  return <TokenBalance ticker="BTC" icon={<BtcAvatarIcon />} tokenName={t`Bitcoin`} {...props} />;
}

interface BitcoinTokenDetailsProps {
  account: Account;
}
export function BitcoinTokenDetails({ account }: BitcoinTokenDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const { value } = useBtcAccountBalance(fingerprint, accountIndex);
  const activity = useAccountActivityByAsset(fingerprint, accountIndex, btcAsset);
  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;
  if (!availableBalance || !quoteBalance) {
    // TODO LEA-3015: add better loading state
    return null;
  }
  return (
    <Token
      tokenId="BTC"
      asset={btcAsset}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      activity={activity.value ?? []}
    >
      <BitcoinAddressList account={account} />
    </Token>
  );
}
