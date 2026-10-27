import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  LeatherApiAddressComplianceCheck,
  LeatherApiClient,
} from '../infrastructure/api/leather/leather-api.client';
import { LeatherApiError } from '../infrastructure/api/leather/leather-api.error';
import { SettingsService } from '../infrastructure/settings/settings.service';
import { ComplianceService, isOfflineComplianceCheckReason } from './compliance.service';

const testAddress = 'bc1qtest';

function makeTimeoutError() {
  const timeoutError = new Error('Promise timed out after 60000 milliseconds');
  timeoutError.name = 'TimeoutError';
  return timeoutError;
}

function makeFlakyApi(
  failures: Error[],
  response: LeatherApiAddressComplianceCheck = makeCheckResponse('compliant', [])
) {
  const api = vi.fn<() => Promise<LeatherApiAddressComplianceCheck>>();
  failures.forEach(failure => api.mockRejectedValueOnce(failure));
  return api.mockResolvedValue(response);
}

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

describe(isOfflineComplianceCheckReason.name, () => {
  it('recognises only the offline reason', () => {
    expect(isOfflineComplianceCheckReason('leather_api_offline')).toBe(true);
    expect(isOfflineComplianceCheckReason('leather_api_network_error')).toBe(false);
    expect(isOfflineComplianceCheckReason('risk_screening_chainalysis_rate_limited')).toBe(false);
  });
});

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
      vi.useFakeTimers();
      try {
        const service = makeService(() => Promise.reject(new TypeError('Failed to fetch')));

        const promise = service.checkAddressCompliance(testAddress);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toEqual({ status: 'unavailable', reason: 'leather_api_network_error' });
      } finally {
        vi.useRealTimers();
      }
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

    describe('transient failure retry', () => {
      afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
      });

      it('retries once after a network error and returns the successful result', async () => {
        vi.useFakeTimers();
        const api = makeFlakyApi([new TypeError('Failed to fetch')]);
        const service = makeService(api);

        const promise = service.checkAddressCompliance(testAddress);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toEqual({ status: 'compliant' });
        expect(api).toHaveBeenCalledTimes(2);
      });

      it('waits before retrying rather than retrying immediately', async () => {
        vi.useFakeTimers();
        const api = makeFlakyApi([new TypeError('Failed to fetch')]);
        const service = makeService(api);

        const promise = service.checkAddressCompliance(testAddress);
        await vi.advanceTimersByTimeAsync(0);

        expect(api).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(1);

        await vi.runAllTimersAsync();
        await promise;
      });

      it('returns unavailable with the network reason when the retry also fails', async () => {
        vi.useFakeTimers();
        const api = makeFlakyApi([
          new TypeError('Failed to fetch'),
          new TypeError('Failed to fetch'),
        ]);
        const service = makeService(api);

        const promise = service.checkAddressCompliance(testAddress);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toEqual({ status: 'unavailable', reason: 'leather_api_network_error' });
        expect(api).toHaveBeenCalledTimes(2);
      });

      it('does not retry when the api responded with an http error', async () => {
        vi.useFakeTimers();
        const api = makeFlakyApi([
          new LeatherApiError(
            'https://api.leather.io/v1/compliance/addresses/bc1qtest',
            503,
            'Service Unavailable'
          ),
        ]);
        const service = makeService(api);

        const promise = service.checkAddressCompliance(testAddress);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toEqual({ status: 'unavailable', reason: 'leather_api_http_503' });
        expect(api).toHaveBeenCalledTimes(1);
      });

      it('does not retry unrecognized errors', async () => {
        vi.useFakeTimers();
        const api = makeFlakyApi([new Error('Rate limited call undefined')]);
        const service = makeService(api);

        const promise = service.checkAddressCompliance(testAddress);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toEqual({ status: 'unavailable', reason: 'leather_api_unknown_error' });
        expect(api).toHaveBeenCalledTimes(1);
      });

      it('does not retry and rejects with an abort error when the caller aborted during the retry delay', async () => {
        vi.useFakeTimers();
        const api = makeFlakyApi([new TypeError('Failed to fetch')]);
        const service = makeService(api);
        const abortController = new AbortController();

        const promise = service.checkAddressCompliance(testAddress, abortController.signal);
        const assertion = expect(promise).rejects.toMatchObject({ name: 'AbortError' });
        await vi.advanceTimersByTimeAsync(0);
        abortController.abort();
        await assertion;

        expect(api).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);
      });

      it('does not retry a rate limiter timeout and maps it to leather_api_timeout', async () => {
        vi.useFakeTimers();
        const api = makeFlakyApi([makeTimeoutError()]);
        const service = makeService(api);

        const promise = service.checkAddressCompliance(testAddress);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toEqual({ status: 'unavailable', reason: 'leather_api_timeout' });
        expect(api).toHaveBeenCalledTimes(1);
      });

      it('does not retry and maps a network error to leather_api_offline when the runtime reports no connectivity', async () => {
        vi.stubGlobal('navigator', { onLine: false });
        const api = makeFlakyApi([new TypeError('Failed to fetch')]);
        const service = makeService(api);

        const result = await service.checkAddressCompliance(testAddress);

        expect(result).toEqual({ status: 'unavailable', reason: 'leather_api_offline' });
        expect(api).toHaveBeenCalledTimes(1);
      });

      it('keeps the unknown reason for unrecognized errors when the runtime reports no connectivity', async () => {
        vi.stubGlobal('navigator', { onLine: false });
        const service = makeService(() => Promise.reject(new Error('Rate limited call undefined')));

        const result = await service.checkAddressCompliance(testAddress);

        expect(result).toEqual({ status: 'unavailable', reason: 'leather_api_unknown_error' });
      });

      it('keeps the http reason when the runtime reports no connectivity', async () => {
        vi.stubGlobal('navigator', { onLine: false });
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
    });
  });
});
