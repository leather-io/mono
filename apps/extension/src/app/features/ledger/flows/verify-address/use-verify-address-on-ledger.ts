import { analytics } from '@shared/utils/analytics';

import { whenPageMode } from '@app/common/utils';

import { handOffLedgerFlowToFullPage } from '../../flow/ledger-flow-handoff';
import { useLedgerFlow } from '../../flow/ledger-flow.context';
import type { LedgerFlowHandoffRequest, VerifyAddressVariant } from '../../flow/ledger-flow.types';

export function useVerifyAddressOnLedger() {
  const { open } = useLedgerFlow();

  return (variant: VerifyAddressVariant) => {
    analytics.track('address_verification_started', { type: variant });
    const request: LedgerFlowHandoffRequest = { kind: 'verify-address', variant };
    whenPageMode({
      full() {
        open(request);
      },
      popup() {
        void handOffLedgerFlowToFullPage(request);
      },
    })();
  };
}
