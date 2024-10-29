import { showChain } from '@/components/widgets/tokens/tokens-widget';
import { AccountId } from '@/models/domain.model';
import {
  useBitcoinAccountTotalBitcoinBalance,
  useWalletTotalBitcoinBalance,
} from '@/queries/balance/bitcoin-balance.query';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { BtcAvatarIcon } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

interface BitcoinTokenBalanceProps {
  availableBalance: Money;
  fiatBalance: Money;
}
export function BitcoinTokenBalance({ availableBalance, fiatBalance }: BitcoinTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="BTC"
      icon={<BtcAvatarIcon />}
      tokenName={t`Bitcoin`}
      chain={t`Bitcoin blockchain`}
      fiatBalance={fiatBalance}
      showChain={showChain}
      availableBalance={availableBalance}
    />
  );
}

export function BitcoinBalance() {
  const { availableBalance, fiatBalance } = useWalletTotalBitcoinBalance();
  return <BitcoinTokenBalance availableBalance={availableBalance} fiatBalance={fiatBalance} />;
}

export function BitcoinBalanceByAccount(props: AccountId) {
  const { availableBalance, fiatBalance } = useBitcoinAccountTotalBitcoinBalance(props);
  return <BitcoinTokenBalance availableBalance={availableBalance} fiatBalance={fiatBalance} />;
}
