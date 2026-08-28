import { describe, expect, it } from 'vitest';

import {
  LeatherApiAddressComplianceCheck,
  LeatherApiClient,
} from '../infrastructure/api/leather/leather-api.client';
import { LeatherApiError } from '../infrastructure/api/leather/leather-api.error';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { ComplianceService } from './compliance.service';

const testAddress = 'bc1qtest';

function makeService(
  fetchAddressComplianceCheck: () => Promise<LeatherApiAddressComplianceCheck>,
  mode: 'mainnet' | 'testnet' = 'mainnet'
) {
  const mockClient = { fetchAddressComplianceCheck } as unknown as LeatherApiClient;
  const mockSettings = {
    getSettings: () => ({ network: { chain: { bitcoin: { mode } } } }),
  } as unknown as SettingsService;
  return new ComplianceService(mockClient, mockSettings);
}

function makeCheckResponse(
  status: LeatherApiAddressComplianceCheck['status'],
  checks: LeatherApiAddressComplianceCheck['checks']
): LeatherApiAddressComplianceCheck {
  return { address: testAddress, status, checks };
}

describe(ComplianceService.name, () => {
  describe('checkAddressCompliance', () => {
    it('returns compliant without calling the api on non-mainnet networks', async () => {
      let apiCalled = false;
      const service = makeService(() => {
        apiCalled = true;
        return Promise.resolve(makeCheckResponse('non_compliant', []));
      }, 'testnet');

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'compliant' });
      expect(apiCalled).toBe(false);
    });

    it('returns compliant when the api reports the address compliant', async () => {
      const service = makeService(() =>
        Promise.resolve(
          makeCheckResponse('compliant', [
            { type: 'ofac', result: 'pass' },
            { type: 'risk_screening', result: 'pass' },
          ])
        )
      );

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'compliant' });
    });

    it('returns non_compliant with the failed check reason when the api reports the address non-compliant', async () => {
      const service = makeService(() =>
        Promise.resolve(
          makeCheckResponse('non_compliant', [
            { type: 'ofac', result: 'fail' },
            { type: 'risk_screening', result: 'pass' },
          ])
        )
      );

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'non_compliant', reason: 'ofac' });
    });

    it('includes the provider in the reason when present on a failed check', async () => {
      const service = makeService(() =>
        Promise.resolve(
          makeCheckResponse('non_compliant', [
            { type: 'ofac', result: 'pass' },
            { type: 'risk_screening', result: 'fail', provider: 'chainalysis' },
          ])
        )
      );

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'non_compliant', reason: 'risk_screening_chainalysis' });
    });

    it('returns non_compliant with unknown reason when the api reports non-compliant without failed checks', async () => {
      const service = makeService(() => Promise.resolve(makeCheckResponse('non_compliant', [])));

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'non_compliant', reason: 'unknown' });
    });

    it('returns unavailable with the errored check reason when the api reports unavailable', async () => {
      const service = makeService(() =>
        Promise.resolve(
          makeCheckResponse('unavailable', [
            { type: 'ofac', result: 'pass' },
            { type: 'risk_screening', result: 'error', errorReason: 'rate_limited' },
          ])
        )
      );

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'unavailable', reason: 'risk_screening_rate_limited' });
    });

    it('includes the provider in the reason when present on an errored check', async () => {
      const service = makeService(() =>
        Promise.resolve(
          makeCheckResponse('unavailable', [
            { type: 'ofac', result: 'pass' },
            {
              type: 'risk_screening',
              result: 'error',
              errorReason: 'rate_limited',
              provider: 'chainalysis',
            },
          ])
        )
      );

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({
        status: 'unavailable',
        reason: 'risk_screening_chainalysis_rate_limited',
      });
    });

    it('joins reasons when multiple checks errored', async () => {
      const service = makeService(() =>
        Promise.resolve(
          makeCheckResponse('unavailable', [
            { type: 'ofac', result: 'error', errorReason: 'upstream_error' },
            { type: 'risk_screening', result: 'error', errorReason: 'rate_limited' },
          ])
        )
      );

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({
        status: 'unavailable',
        reason: 'ofac_upstream_error,risk_screening_rate_limited',
      });
    });

    it('returns unavailable with unknown_error when the api reports unavailable without errored checks', async () => {
      const service = makeService(() => Promise.resolve(makeCheckResponse('unavailable', [])));

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'unavailable', reason: 'unknown_error' });
    });

    it('returns unavailable with the http status when the api rejects the request', async () => {
      const service = makeService(() =>
        Promise.reject(
          new LeatherApiError(
            'https://api.leather.io/v1/compliance/addresses/bc1qtest',
            500,
            'Internal Server Error'
          )
        )
      );

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'unavailable', reason: 'leather_api_http_500' });
    });

    it('returns unavailable when the request never reaches the api', async () => {
      const service = makeService(() => Promise.reject(new TypeError('Failed to fetch')));

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'unavailable', reason: 'leather_api_network_error' });
    });

    it('returns unavailable with unknown_error for unrecognized errors', async () => {
      const service = makeService(() => Promise.reject(new Error('Rate limited call undefined')));

      const result = await service.checkAddressCompliance(testAddress);

      expect(result).toEqual({ status: 'unavailable', reason: 'leather_api_unknown_error' });
    });

    it('rethrows instead of returning unavailable when the caller aborted the request', async () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      const service = makeService(() => Promise.reject(abortError));
      const abortController = new AbortController();
      abortController.abort();

      await expect(
        service.checkAddressCompliance(testAddress, abortController.signal)
      ).rejects.toBe(abortError);
    });
  });
});
