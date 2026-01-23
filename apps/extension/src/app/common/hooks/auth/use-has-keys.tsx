import { useHasLedgerKeys } from '@app/store/ledger/ledger.selectors';
import { useActiveSoftwareKey } from '@app/store/software-keys/software-key.selectors';

export function useHasKeys() {
  const hasSoftwareKeys = !!useActiveSoftwareKey();
  const hasLedgerKeys = useHasLedgerKeys();

  return {
    hasSoftwareKeys,
    hasLedgerKeys,
    hasKeys: hasSoftwareKeys || hasLedgerKeys,
  };
}
