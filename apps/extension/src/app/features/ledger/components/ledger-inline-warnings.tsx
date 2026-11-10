import type { SupportedBlockchains } from '@leather.io/models';
import { Callout } from '@leather.io/ui';

import type { LatestDeviceResponse } from '@app/features/ledger/utils/generic-ledger-utils';
import { Capitalize } from '@app/ui/utils/capitalize';

interface RequiresChainProp {
  chain: SupportedBlockchains;
}

interface CommonLedgerInlineWarningsProps extends RequiresChainProp {
  latestDeviceResponse: LatestDeviceResponse;
}

function LedgerDeviceLockedWarning({ chain }: RequiresChainProp) {
  return (
    <Callout variant="warning" textAlign="left">
      Your Ledger is locked. Unlock it and open the {''}
      <Capitalize>{chain}</Capitalize>
      {''} app to continue.
    </Callout>
  );
}

export function CommonLedgerDeviceInlineWarnings({
  chain,
  latestDeviceResponse,
}: CommonLedgerInlineWarningsProps) {
  if (!latestDeviceResponse) return null;

  if (latestDeviceResponse.deviceLocked) return <LedgerDeviceLockedWarning chain={chain} />;
  return null;
}
