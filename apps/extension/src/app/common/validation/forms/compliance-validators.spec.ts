import { beforeEach, describe, expect, test, vi } from 'vitest';

import { defaultNetworksKeyedById } from '@leather.io/models';
import type { AddressComplianceCheckResult, UserSettings } from '@leather.io/services';

import { btcAddressValidator } from '@shared/forms/address-validators';
import { stringField } from '@shared/forms/field-schemas';

import { queryClient } from '@app/common/persistence';

import { complianceValidator } from './compliance-validators';

const { checkAddressCompliance, track } = vi.hoisted(() => ({
  checkAddressCompliance: vi.fn<(address: string) => Promise<AddressComplianceCheckResult>>(),
  track: vi.fn(),
}));

vi.mock('@leather.io/services', () => ({
  getComplianceService: () => ({ checkAddressCompliance }),
  isOfflineComplianceCheckReason: (reason: string) => reason === 'leather_api_offline',
}));

vi.mock('@shared/utils/analytics', () => ({ analytics: { track } }));

vi.mock('@app/common/persistence', async () => {
  const { QueryClient } = await import('@tanstack/react-query');
  return { queryClient: new QueryClient() };
});

const testAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
const screeningPoint = 'send_form_btc';
const settings: UserSettings = {
  network: defaultNetworksKeyedById.mainnet,
  quoteCurrency: 'USD',
  assetVisibility: {},
};

const schema = stringField().check(
  complianceValidator(btcAddressValidator(), screeningPoint, settings)
);

async function validate(value: string) {
  const result = await schema.safeParseAsync(value);
  return result.success;
}

describe(complianceValidator.name, () => {
  beforeEach(() => {
    queryClient.clear();
    checkAddressCompliance.mockReset();
    track.mockReset();
  });

  test('skips the check when the value is not a valid address', async () => {
    expect(await validate('not-an-address')).toBe(true);

    expect(checkAddressCompliance).not.toHaveBeenCalled();
  });

  test('passes a compliant address and reuses the cached result', async () => {
    checkAddressCompliance.mockResolvedValue({ status: 'compliant' });

    expect(await validate(testAddress)).toBe(true);
    expect(await validate(testAddress)).toBe(true);

    expect(checkAddressCompliance).toHaveBeenCalledTimes(1);
    expect(track).not.toHaveBeenCalled();
  });

  test('rejects a non-compliant address and tracks it', async () => {
    checkAddressCompliance.mockResolvedValue({ status: 'non_compliant', reason: 'ofac' });

    expect(await validate(testAddress)).toBe(false);

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

    expect(await validate(testAddress)).toBe(true);
    expect(await validate(testAddress)).toBe(false);

    expect(checkAddressCompliance).toHaveBeenCalledTimes(2);
    expect(track).toHaveBeenCalledWith('compliance_check_unavailable', {
      address: testAddress,
      reason: 'leather_api_network_error',
      screeningPoint,
    });
  });

  test('fails open without tracking when the check was unavailable because the browser is offline', async () => {
    checkAddressCompliance.mockResolvedValue({
      status: 'unavailable',
      reason: 'leather_api_offline',
    });

    expect(await validate(testAddress)).toBe(true);

    expect(track).not.toHaveBeenCalled();
  });
});
