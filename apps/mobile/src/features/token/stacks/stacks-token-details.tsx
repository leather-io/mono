import { AssetAvatar } from '@/components/asset-avatar';
import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useActivityByAsset } from '@/queries/activity/activity.query';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/core/macro';
import { capitalize } from 'remeda';

import { stxAsset } from '@leather.io/constants';
import { AccountId } from '@leather.io/models';

import { Token } from '../token';

type StacksTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;
export function StacksTokenBalance(props: StacksTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="STX"
      icon={<AssetAvatar asset={stxAsset} />}
      tokenName={t`Stacks`}
      {...props}
    />
  );
}

interface StacksTokenDetailsProps {
  account: AccountId;
}
export function StacksTokenDetails({ account }: StacksTokenDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const balance = useStxAccountBalance(fingerprint, accountIndex);
  const activity = useActivityByAsset(fingerprint, accountIndex, stxAsset);

  const chain = capitalize(stxAsset.chain);
  const name = `${chain} (${stxAsset.symbol})`;
  return (
    <Token
      asset={stxAsset}
      icon={<AssetAvatar asset={stxAsset} />}
      balance={balance}
      activity={activity}
      canSend={true}
      layer={t`Layer 2`}
      title={chain}
      name={name}
    />
  );
}
