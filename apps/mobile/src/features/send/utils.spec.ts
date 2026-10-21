import { queryClient } from '@/queries/query';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { defaultNetworksKeyedById } from '@leather.io/models';
import type { AddressComplianceCheckResult, UserSettings } from '@leather.io/services';

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
const settings: UserSettings = {
  network: defaultNetworksKeyedById.mainnet,
  quoteCurrency: 'USD',
  assetVisibility: {},
};

function validate(shouldCheckCompliance = true) {
  return addressComplianceValidator({
    address: testAddress,
    shouldCheckCompliance,
    screeningPoint,
    settings,
  });
}

describe(addressComplianceValidator.name, () => {
  beforeEach(() => {
    queryClient.clear();
    checkAddressCompliance.mockReset();
    track.mockReset();
  });

  test('skips the check when the address is not ready to be screened', async () => {
    expect(await validate(false)).toBe(true);

    expect(checkAddressCompliance).not.toHaveBeenCalled();
  });

  test('passes a compliant address and reuses the cached result', async () => {
    checkAddressCompliance.mockResolvedValue({ status: 'compliant' });

    expect(await validate()).toBe(true);
    expect(await validate()).toBe(true);

    expect(checkAddressCompliance).toHaveBeenCalledTimes(1);
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

  test('fails open on an unavailable result, tracks it, and re-screens on the next validation', async () => {
    checkAddressCompliance
      .mockResolvedValueOnce({ status: 'unavailable', reason: 'leather_api_network_error' })
      .mockResolvedValue({ status: 'non_compliant', reason: 'ofac' });

    expect(await validate()).toBe(true);
    expect(await validate()).toBe(false);

    expect(checkAddressCompliance).toHaveBeenCalledTimes(2);
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

  test('deduplicates concurrent validations of the same address', async () => {
    checkAddressCompliance.mockResolvedValue({ status: 'compliant' });

    const results = await Promise.all([validate(), validate()]);

    expect(results).toEqual([true, true]);
    expect(checkAddressCompliance).toHaveBeenCalledTimes(1);
  });
});
