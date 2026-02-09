import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { t } from '@lingui/core/macro';

import { StacksFilledCircleIcon, StxAvatarIcon } from '@leather.io/ui/native';

type StacksTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;
export function StacksTokenBalance(props: StacksTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="STX"
      icon={<StxAvatarIcon indicator={<StacksFilledCircleIcon variant="small" />} />}
      tokenName={t`Stacks`}
      {...props}
    />
  );
}
