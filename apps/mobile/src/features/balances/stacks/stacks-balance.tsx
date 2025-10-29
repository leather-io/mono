import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { OnPressTokenDetails } from '@/features/token/types';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/core/macro';

import { stxAsset } from '@leather.io/constants';
import { AccountId, CryptoAssetProtocols } from '@leather.io/models';
import { StxAvatarIcon } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

type StacksTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;
export function StacksTokenBalance(props: StacksTokenBalanceProps) {
  return <TokenBalance ticker="STX" icon={<StxAvatarIcon />} tokenName={t`Stacks`} {...props} />;
}

export function StacksBalanceByAccount({
  accountIndex,
  fingerprint,
  onPress,
}: OnPressTokenDetails & AccountId) {
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
      onPress={
        onPress
          ? () =>
              onPress?.({
                assetProtocol: CryptoAssetProtocols.nativeStx,
                assetId: serializeAssetId(getAssetId(stxAsset)),
              })
          : undefined
      }
      isLoading={state === 'loading'}
    />
  );
}
