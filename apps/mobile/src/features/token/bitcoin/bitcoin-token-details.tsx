import { useSwapSbtcBridgingFlag } from '@/features/feature-flags';
import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useActivityByAsset } from '@/queries/activity/activity.query';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/core/macro';
import { capitalize } from 'remeda';

import { btcAsset } from '@leather.io/constants';
import { AccountId } from '@leather.io/models';
import { BtcAvatarIcon } from '@leather.io/ui/native';

import { Token } from '../token';
import { BitcoinAddressList } from './bitcoin-address-list';

type BitcoinTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;

export function BitcoinTokenBalance(props: BitcoinTokenBalanceProps) {
  return <TokenBalance ticker="BTC" icon={<BtcAvatarIcon />} tokenName={t`Bitcoin`} {...props} />;
}

interface BitcoinTokenDetailsProps {
  account: AccountId;
}
export function BitcoinTokenDetails({ account }: BitcoinTokenDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const balance = useBtcAccountBalance(fingerprint, accountIndex);
  const activity = useActivityByAsset(fingerprint, accountIndex, btcAsset);
  const sbtcBridgingEnabled = useSwapSbtcBridgingFlag();
  const chain = capitalize(btcAsset.chain);
  const name = `${chain} (${btcAsset.symbol})`;
  return (
    <Token
      asset={btcAsset}
      icon={<BtcAvatarIcon />}
      balance={balance}
      activity={activity}
      canSwap={sbtcBridgingEnabled}
      layer={t`Layer 1`}
      title={chain}
      name={name}
    >
      <BitcoinAddressList account={account} />
    </Token>
  );
}
