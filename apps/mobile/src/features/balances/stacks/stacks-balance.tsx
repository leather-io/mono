import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/core/macro';
import { useRouter } from 'expo-router';

import { stxAsset } from '@leather.io/constants';
import { AccountId } from '@leather.io/models';
import { StacksFilledCircleIcon, StxAvatarIcon } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

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

export function StacksBalanceByAccount({ accountIndex, fingerprint }: AccountId) {
  const { state, value } = useStxAccountBalance(fingerprint, accountIndex);
  const router = useRouter();

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
        router.navigate({
          pathname: '/(tabs)/(index)/[assetId]',
          params: { assetId: serializeAssetId(getAssetId(stxAsset)) },
        })
      }
      isLoading={state === 'loading'}
    />
  );
}
