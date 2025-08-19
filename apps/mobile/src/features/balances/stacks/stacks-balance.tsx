import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useStxAccountBalance, useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/core/macro';

import { CryptoAssetProtocol, CryptoAssetProtocols } from '@leather.io/models';
import { StxAvatarIcon } from '@leather.io/ui/native';

type StacksTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;
export function StacksTokenBalance(props: StacksTokenBalanceProps) {
  return <TokenBalance ticker="STX" icon={<StxAvatarIcon />} tokenName={t`Stacks`} {...props} />;
}

interface StacksBalanceProps {
  onPress?: (assetProtocol: CryptoAssetProtocol, tokenId: string) => void;
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
      onPress={() => onPress?.(CryptoAssetProtocols.nativeStx, 'STX')}
      isLoading={state === 'loading'}
    />
  );
}

interface StacksBalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
  onPress?: (assetProtocol: CryptoAssetProtocol, tokenId: string) => void;
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
      onPress={() => onPress?.(CryptoAssetProtocols.nativeStx, 'STX')}
      isLoading={state === 'loading'}
    />
  );
}
