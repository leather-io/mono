import { type BitcoinNetworkModes } from '@leather.io/models';
import { ensureArray } from '@leather.io/utils';

import { compliantErrorBody } from './compliance-checker.constants';
import { useCheckAddressComplianceQueries } from './compliance-checker.query';

interface UseBreakOnNonCompliantEntityProps {
  address: string | string[];
  nativeSegwitSignerAddress: string;
  networkMode: BitcoinNetworkModes;
  callback: () => void;
}

interface UseBreakOnNonCompliantEntityResult {
  isCompliant: boolean;
}

// TODO LEA-2189  - refactor extension to use this hook
export function useBreakOnNonCompliantEntity({
  address,
  nativeSegwitSignerAddress,
  networkMode,
  callback,
}: UseBreakOnNonCompliantEntityProps): UseBreakOnNonCompliantEntityResult {
  const complianceReports = useCheckAddressComplianceQueries(
    [nativeSegwitSignerAddress ?? '', ...ensureArray(address)],
    networkMode
  );

  if (complianceReports.some(report => report.data?.isOnSanctionsList)) {
    callback();
    throw new Error(compliantErrorBody);
  }

  return { isCompliant: true };
}
