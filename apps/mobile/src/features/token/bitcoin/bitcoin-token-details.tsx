import { useSwapSbtcBridgingFlag } from '@/features/feature-flags';
import { useActivityByAssetId } from '@/queries/activity/activity.query';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/core/macro';
import { capitalize } from 'remeda';

import { btcAsset } from '@leather.io/constants';
import { type AccountId } from '@leather.io/models';
import { BtcAvatarIcon } from '@leather.io/ui/native';
import { getAssetId } from '@leather.io/utils';

import { Token } from '../token';
import { BitcoinAddressList } from './bitcoin-address-list';

interface BitcoinTokenDetailsProps {
  account: AccountId;
}
export function BitcoinTokenDetails({ account }: BitcoinTokenDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const balance = useBtcAccountBalance(fingerprint, accountIndex);
  const activity = useActivityByAssetId(fingerprint, accountIndex, getAssetId(btcAsset));
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
