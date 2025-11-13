import { useMemo } from 'react';

import { analytics } from '@shared/utils/analytics';

export function useLedgerAnalytics() {
  return useMemo(
    () => ({
      trackDeviceVersionInfo(info: object) {
        analytics.track('ledger_app_version_info', { info });
      },
      transactionSignedOnLedgerSuccessfully() {
        analytics.track('ledger_transaction_signed_approved');
      },
      transactionSignedOnLedgerRejected() {
        analytics.track('ledger_transaction_signed_rejected');
      },
      messageSignedOnLedgerSuccessfully() {
        analytics.track('ledger_message_signed_approved');
      },
      messageSignedOnLedgerRejected() {
        analytics.track('ledger_message_signed_rejected');
      },
      publicKeysPulledFromLedgerSuccessfully() {
        analytics.track('ledger_public_keys_pulled_from_device');
      },
    }),
    []
  );
}
