import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import { ChainalysisApiClient } from '../infrastructure/api/chainalysis/chainalysis-api.client';
import { ChainalysisRiskAssessment } from '../infrastructure/api/chainalysis/chainalysis-api.schema';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { ComplianceService } from './compliance.service';

const testAddress = 'bc1qtest';

function makeService(
  fetchAddressRiskAssessment: () => Promise<ChainalysisRiskAssessment>,
  mode: 'mainnet' | 'testnet' = 'mainnet'
) {
  const mockClient = { fetchAddressRiskAssessment } as unknown as ChainalysisApiClient;
  const mockSettings = {
    getSettings: () => ({ network: { chain: { bitcoin: { mode } } } }),
  } as unknown as SettingsService;
  return new ComplianceService(mockClient, mockSettings);
}

describe(ComplianceService.name, () => {
  describe('checkAddressCompliance', () => {
    it('returns compliant without calling the api on non-mainnet networks', async () => {
      let apiCalled = false;
      const service = makeService(() => {
        apiCalled = true;
        return Promise.resolve({ risk: 'Severe' });
      }, 'testnet');

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'compliant' });
      expect(apiCalled).toBe(false);
    });

    it.each(['High', 'Severe'] as const)('returns non_compliant for %s risk', async risk => {
      const service = makeService(() => Promise.resolve({ risk }));

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'non_compliant', risk });
    });

    it.each(['Low', 'Medium'] as const)('returns compliant for %s risk', async risk => {
      const service = makeService(() => Promise.resolve({ risk }));

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'compliant' });
    });

    it('returns unavailable with the http status when the api rejects the request', async () => {
      const error = new AxiosError('Forbidden');
      error.response = { status: 403 } as unknown as AxiosError['response'];
      const service = makeService(() => Promise.reject(error));

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'unavailable', reason: 'http_403' });
    });

    it('returns unavailable when the request never reaches the api', async () => {
      const service = makeService(() => Promise.reject(new AxiosError('Network Error')));

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'unavailable', reason: 'network_error' });
    });

    it('returns unavailable when the response shape is unexpected', async () => {
      const service = makeService(() => Promise.reject(new ZodError([])));

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'unavailable', reason: 'unexpected_response_shape' });
    });
  });
});
