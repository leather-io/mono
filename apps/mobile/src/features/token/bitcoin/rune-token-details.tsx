import { ErrorFallbackTab } from '@/components/error/error';
import { useRuneBalanceByRuneName } from '@/queries/balance/runes-balance.query';
import { t } from '@lingui/core/macro';

import { AccountId } from '@leather.io/models';
import { RunesAvatarIcon } from '@leather.io/ui/native';
import { SerializedCryptoAssetId, deserializeAssetId } from '@leather.io/utils';

import { TokenLoading } from '../components/token-loading';
import { Token } from '../token';

interface RuneTokenDetailsProps {
  account: AccountId;
  assetId: SerializedCryptoAssetId;
}
export function RuneTokenDetails({ assetId, account }: RuneTokenDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const { id } = deserializeAssetId(assetId);
  const balance = useRuneBalanceByRuneName(fingerprint, accountIndex, id);

  if (balance.state === 'loading') {
    // show full loading screen before <Token handles it more gracefully
    return <TokenLoading />;
  }
  if (balance.state === 'error') {
    return <ErrorFallbackTab />;
  }
  if (balance.state === 'success' && balance.value) {
    const { asset } = balance.value;

    return (
      <Token
        icon={<RunesAvatarIcon />}
        asset={asset}
        balance={balance}
        activity={{ state: 'success', value: [] }}
        title={asset.spacedRuneName}
        name={`${asset.spacedRuneName} ${asset.symbol}`}
        layer={t`Layer 1 · Bitcoin`}
        canSend={false}
      />
    );
  }
}
