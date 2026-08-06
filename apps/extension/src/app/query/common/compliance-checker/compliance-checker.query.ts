import { useRef } from 'react';

import { useQueries } from '@tanstack/react-query';

import { createAddressComplianceCheckQueryConfig } from '@leather.io/queries';
import { ensureArray, isEmptyString, uniqueArray } from '@leather.io/utils';

import { analytics } from '@shared/utils/analytics';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { useCurrentAccountNativeSegwitIndexZeroPayerNullable } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

function useCheckAddressComplianceQueries(addresses: string[]) {
  const settings = useUserSettings();
  const uniqueAddresses = uniqueArray(addresses.filter(address => !isEmptyString(address)));
  const results = useQueries({
    queries: uniqueAddresses.map(address =>
      createAddressComplianceCheckQueryConfig(address, settings)
    ),
  });
  return results.map((result, index) => ({
    address: uniqueAddresses[index],
    check: result.data,
  }));
}

export const compliantErrorBody = 'Unable to handle request, errorCode: 1398';

export function useBreakOnNonCompliantEntity(address: string | string[] = '') {
  const trackedUnavailableAddresses = useRef(new Set<string>());
  const nativeSegwitSigner = useCurrentAccountNativeSegwitIndexZeroPayerNullable();

  const complianceChecks = useCheckAddressComplianceQueries([
    nativeSegwitSigner?.address ?? '',
    ...ensureArray(address),
  ]);

  complianceChecks.forEach(({ address: checkedAddress, check }) => {
    if (
      check?.status === 'unavailable' &&
      !trackedUnavailableAddresses.current.has(checkedAddress)
    ) {
      trackedUnavailableAddresses.current.add(checkedAddress);
      analytics.track('compliance_check_unavailable', {
        address: checkedAddress,
        reason: check.reason,
      });
    }
  });

  const nonCompliantCheck = complianceChecks.find(
    ({ check }) => check?.status === 'non_compliant'
  )?.check;
  if (nonCompliantCheck?.status === 'non_compliant') {
    analytics.track('non_compliant_entity_detected', {
      address,
      reason: nonCompliantCheck.reason,
    });
    throw new Error(compliantErrorBody);
  }
}
