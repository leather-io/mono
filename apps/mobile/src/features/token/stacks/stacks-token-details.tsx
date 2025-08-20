import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useAccountActivityByAsset } from '@/queries/activity/account-activity.query';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { Account } from '@/store/accounts/accounts';
import { t } from '@lingui/core/macro';

import { stxAsset } from '@leather.io/constants';
import { StxAvatarIcon } from '@leather.io/ui/native';

import { Token } from '../token';
import { StacksAddressList } from './stacks-address-list';

type StacksTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;
export function StacksTokenBalance(props: StacksTokenBalanceProps) {
  return <TokenBalance ticker="STX" icon={<StxAvatarIcon />} tokenName={t`Stacks`} {...props} />;
}

interface StacksTokenDetailsByAccountProps {
  account: Account;
}
export function StacksTokenDetailsByAccount({ account }: StacksTokenDetailsByAccountProps) {
  const { fingerprint, accountIndex } = account;
  const { value } = useStxAccountBalance(fingerprint, accountIndex);
  const activity = useAccountActivityByAsset(fingerprint, accountIndex, stxAsset);
  const availableBalance = value?.stx.availableUnlockedBalance;
  const quoteBalance = value?.quote.availableUnlockedBalance;
  if (!availableBalance || !quoteBalance || !activity.value) {
    // TODO LEA-3015: add better loading state
    return null;
  }

  return (
    <Token
      tokenId="STX"
      asset={stxAsset}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      activity={activity.value}
      canSend={true}
    >
      <StacksAddressList account={account} />
    </Token>
  );
}
