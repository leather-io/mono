import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { t } from '@lingui/core/macro';

import { BitcoinFilledCircleIcon, BtcAvatarIcon } from '@leather.io/ui/native';

type BitcoinTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;
export function BitcoinTokenBalance(props: BitcoinTokenBalanceProps) {
  const btcProps = {
    ticker: 'BTC' as const,
    icon: <BtcAvatarIcon indicator={<BitcoinFilledCircleIcon variant="small" />} />,
    tokenName: t`Bitcoin`,
  };

  return <TokenBalance {...btcProps} {...props} />;
}
