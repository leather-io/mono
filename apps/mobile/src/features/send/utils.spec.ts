import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { AddressComplianceCheckResult } from '@leather.io/services';

import { addressComplianceValidator } from './utils';

const { checkAddressCompliance, track } = vi.hoisted(() => ({
  checkAddressCompliance: vi.fn<(address: string) => Promise<AddressComplianceCheckResult>>(),
  track: vi.fn(),
}));

vi.mock('@leather.io/services', () => ({
  getComplianceService: () => ({ checkAddressCompliance }),
  isOfflineComplianceCheckReason: (reason: string) => reason === 'leather_api_offline',
}));

vi.mock('@/utils/analytics', () => ({ analytics: { track } }));

const testAddress = 'bc1qtest';
const screeningPoint = 'send_form_btc';

function validate(shouldCheckCompliance = true) {
  return addressComplianceValidator({
    address: testAddress,
    shouldCheckCompliance,
    screeningPoint,
  });
}

describe(addressComplianceValidator.name, () => {
  beforeEach(() => {
    checkAddressCompliance.mockReset();
    track.mockReset();
  });

  test('skips the check when the address is not ready to be screened', async () => {
    expect(await validate(false)).toBe(true);

    expect(checkAddressCompliance).not.toHaveBeenCalled();
  });

  test('passes a compliant address', async () => {
    checkAddressCompliance.mockResolvedValue({ status: 'compliant' });

    expect(await validate()).toBe(true);

    expect(track).not.toHaveBeenCalled();
  });

  test('rejects a non-compliant address and tracks it', async () => {
    checkAddressCompliance.mockResolvedValue({ status: 'non_compliant', reason: 'ofac' });

    expect(await validate()).toBe(false);

    expect(track).toHaveBeenCalledWith('non_compliant_entity_detected', {
      address: testAddress,
      reason: 'ofac',
      screeningPoint,
    });
  });

  test('fails open on an unavailable result and tracks it', async () => {
    checkAddressCompliance.mockResolvedValue({
      status: 'unavailable',
      reason: 'leather_api_network_error',
    });

    expect(await validate()).toBe(true);

    expect(track).toHaveBeenCalledWith('compliance_check_unavailable', {
      address: testAddress,
      reason: 'leather_api_network_error',
      screeningPoint,
    });
  });

  test('fails open without tracking when the check was unavailable because the device is offline', async () => {
    checkAddressCompliance.mockResolvedValue({
      status: 'unavailable',
      reason: 'leather_api_offline',
    });

    expect(await validate()).toBe(true);

    expect(track).not.toHaveBeenCalled();
  });
});
