import { ErrorFallbackTab } from '@/components/error/error';
import { useSip10ActivityByAssetId } from '@/queries/activity/sip10-activity.query';
import { useSip10BalanceByAssetId } from '@/queries/balance/sip10-balance.query';
import { t } from '@lingui/core/macro';

import { AccountId } from '@leather.io/models';
import { Sip10AvatarIcon } from '@leather.io/ui/native';
import { SerializedCryptoAssetId, deserializeAssetId } from '@leather.io/utils';

import { TokenLoading } from '../components/token-loading';
import { Token } from '../token';

interface Sip10TokenDetailsProps {
  account: AccountId;
  assetId: SerializedCryptoAssetId;
}
export function Sip10TokenDetails({ assetId, account }: Sip10TokenDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const { id } = deserializeAssetId(assetId);
  const balance = useSip10BalanceByAssetId(fingerprint, accountIndex, id);
  const activity = useSip10ActivityByAssetId(fingerprint, accountIndex, id);
  // SIP-10 asset relies on balance being loaded
  const asset = balance.value?.asset;
  if (balance.state === 'error' || !asset) {
    return <ErrorFallbackTab />;
  }
  if (balance.state === 'loading') {
    return <TokenLoading />;
  }
  const { name, imageCanonicalUri } = asset;

  return (
    <Token
      icon={
        <Sip10AvatarIcon contractId={assetId} imageCanonicalUri={imageCanonicalUri} name={name} />
      }
      asset={asset}
      balance={balance}
      activity={activity}
      title={name}
      name={name}
      layer={t`Layer 2 · Stacks`}
    />
  );
}
