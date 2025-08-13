import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import {
  useAccountActivityByAsset,
  useTotalActivityByAsset,
} from '@/queries/activity/account-activity.query';
import { useStxAccountBalance, useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { t } from '@lingui/core/macro';

import { stxAsset } from '@leather.io/constants';
import { StxAvatarIcon } from '@leather.io/ui/native';

import { AccountList } from '../components/account-list';
import { Token } from '../token';
import { StacksAccountListItem } from './stacks-account-list';
import { StacksAddressList } from './stacks-address-list';

type StacksTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;
export function StacksTokenBalance(props: StacksTokenBalanceProps) {
  return <TokenBalance ticker="STX" icon={<StxAvatarIcon />} tokenName={t`Stacks`} {...props} />;
}

export function StacksTokenDetails() {
  const { state, value } = useStxTotalBalance();
  const activity = useTotalActivityByAsset(stxAsset);
  const availableBalance = value?.stx.availableUnlockedBalance;
  const quoteBalance = value?.quote.availableUnlockedBalance;
  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <Token
      tokenId="STX"
      asset={stxAsset}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      activity={activity.value ?? []}
      canSend={true}
    >
      <AccountList
        listItem={(account, wallet) => (
          <StacksAccountListItem
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

interface StacksTokenDetailsByAccountProps {
  accountIndex: number;
  fingerprint: string;
}
export function StacksTokenDetailsByAccount({
  accountIndex,
  fingerprint,
}: StacksTokenDetailsByAccountProps) {
  const { state, value } = useStxAccountBalance(fingerprint, accountIndex);
  const activity = useAccountActivityByAsset(fingerprint, accountIndex, stxAsset);
  const availableBalance = value?.stx.availableUnlockedBalance;
  const quoteBalance = value?.quote.availableUnlockedBalance;
  const account = useAccountByIndex(fingerprint, accountIndex);
  if (!availableBalance || !quoteBalance || !account || !activity.value) {
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
