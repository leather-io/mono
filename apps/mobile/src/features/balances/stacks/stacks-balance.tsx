import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useStxAccountBalance, useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/macro';

import { stxAsset } from '@leather.io/constants';
import { StxAvatarIcon } from '@leather.io/ui/native';

import { OnOpenTokenProps } from '../balances';

type StacksTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;
export function StacksTokenBalance(props: StacksTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="STX"
      icon={<StxAvatarIcon />}
      tokenName={t({
        id: 'asset_name.stacks',
        message: 'Stacks',
      })}
      {...props}
    />
  );
}

interface StacksBalanceProps {
  onPress?: ({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) => void;
}

export function StacksBalance({ onPress }: StacksBalanceProps) {
  const { state, value } = useStxTotalBalance();

  const availableBalance = value?.stx.availableUnlockedBalance;
  const quoteBalance = value?.quote.availableUnlockedBalance;
  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <StacksTokenBalance
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      onPress={() => onPress?.({ asset: stxAsset, availableBalance, quoteBalance })}
      isLoading={state === 'loading'}
    />
  );
}

interface StacksBalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
  onPress?: ({
    accountIndex,
    fingerprint,
    asset,
    availableBalance,
    quoteBalance,
  }: OnOpenTokenProps) => void;
}
export function StacksBalanceByAccount({
  accountIndex,
  fingerprint,
  onPress,
}: StacksBalanceByAccountProps) {
  const { state, value } = useStxAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.stx.availableUnlockedBalance;
  const quoteBalance = value?.quote.availableUnlockedBalance;

  if (!availableBalance || !quoteBalance) {
    return null;
  }

  return (
    <StacksTokenBalance
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      onPress={() =>
        onPress?.({ accountIndex, fingerprint, asset: stxAsset, availableBalance, quoteBalance })
      }
      isLoading={state === 'loading'}
    />
  );
}
