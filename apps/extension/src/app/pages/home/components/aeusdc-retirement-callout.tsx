import { AEUSDC_ASSET_PRINCIPAL } from '@leather.io/constants';

import { useSip10AccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';
import { useCurrentAccountId } from '@app/store/accounts/account';

import { DismissibleCallout } from './dismissible-callout';

const aeusdcRetirementMessageId = 'aeusdc-retirement';

export function AeusdcRetirementCallout() {
  const accountId = useCurrentAccountId();
  const balance = useSip10AccountBalance(accountId, { includeHiddenAssets: true });

  if (balance.state !== 'success') return null;

  const hasAeusdc = balance.value.sip10s.some(
    sip10 =>
      sip10.asset.contractId === AEUSDC_ASSET_PRINCIPAL &&
      sip10.crypto.availableBalance.amount.isGreaterThan(0)
  );

  if (!hasAeusdc) return null;

  return (
    <DismissibleCallout
      messageId={aeusdcRetirementMessageId}
      variant="warning"
      title="aeUSDC is being retired"
    >
      Swap to USDCx before September 2026. After that, balances can't be exited.
    </DismissibleCallout>
  );
}
