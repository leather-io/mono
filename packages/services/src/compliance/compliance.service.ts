import { inject, injectable } from 'inversify';

import { isDefined, isError } from '@leather.io/utils';

import {
  type LeatherApiAddressComplianceCheck,
  LeatherApiClient,
} from '../infrastructure/api/leather/leather-api.client';
import { LeatherApiError } from '../infrastructure/api/leather/leather-api.error';
import { selectBitcoinNetworkMode } from '../infrastructure/settings/settings.selectors';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';

export type AddressComplianceCheckResult =
  | { status: 'compliant' }
  | { status: 'non_compliant'; reason: string }
  | { status: 'unavailable'; reason: string };

type LeatherApiUnavailableReason =
  | `leather_api_http_${number}`
  | 'leather_api_timeout'
  | 'leather_api_offline'
  | 'leather_api_network_error'
  | 'leather_api_unknown_error';

const offlineUnavailableReason: LeatherApiUnavailableReason = 'leather_api_offline';

const complianceCheckRetryDelayMs = 750;

const queueTimeoutErrorName = 'TimeoutError';

export function isOfflineComplianceCheckReason(reason: string) {
  return reason === offlineUnavailableReason;
}

function isRuntimeOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function isQueueTimeoutError(error: unknown) {
  return isError(error) && error.name === queueTimeoutErrorName;
}

function isNetworkShapedError(error: unknown) {
  return error instanceof TypeError;
}

function waitUnlessAborted(ms: number, signal?: AbortSignal) {
  return new Promise<void>(resolve => {
    function onAbort() {
      clearTimeout(timer);
      resolve();
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

@injectable()
export class ComplianceService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    @inject(Types.SettingsService) private readonly settings: SettingsService
  ) {}

  public async checkAddressCompliance(
    address: string,
    signal?: AbortSignal
  ): Promise<AddressComplianceCheckResult> {
    if (selectBitcoinNetworkMode(this.settings.getSettings()) !== 'mainnet') {
      return { status: 'compliant' };
    }

    try {
      const complianceCheck = await this.fetchAddressComplianceCheckWithRetry(address, signal);
      if (complianceCheck.status === 'non_compliant') {
        return { status: 'non_compliant', reason: this.getFailedChecksReason(complianceCheck) };
      }
      if (complianceCheck.status === 'unavailable') {
        return { status: 'unavailable', reason: this.getErroredChecksReason(complianceCheck) };
      }
      return { status: complianceCheck.status };
    } catch (error) {
      if (signal?.aborted) throw error;
      return { status: 'unavailable', reason: this.getLeatherApiUnavailableReason(error) };
    }
  }

  private async fetchAddressComplianceCheckWithRetry(
    address: string,
    signal?: AbortSignal
  ): Promise<LeatherApiAddressComplianceCheck> {
    try {
      return await this.leatherApiClient.fetchAddressComplianceCheck(address, { signal });
    } catch (error) {
      if (signal?.aborted || isRuntimeOffline() || !isNetworkShapedError(error)) throw error;
      await waitUnlessAborted(complianceCheckRetryDelayMs, signal);
      signal?.throwIfAborted();
      return this.leatherApiClient.fetchAddressComplianceCheck(address, { signal });
    }
  }

  private getFailedChecksReason(complianceCheck: LeatherApiAddressComplianceCheck): string {
    const failedChecks = complianceCheck.checks.filter(check => check.result === 'fail');
    if (failedChecks.length === 0) return 'unknown';
    return failedChecks
      .map(check => [check.type, check.provider].filter(isDefined).join('_'))
      .join(',');
  }

  private getErroredChecksReason(complianceCheck: LeatherApiAddressComplianceCheck): string {
    const erroredChecks = complianceCheck.checks.filter(check => check.result === 'error');
    if (erroredChecks.length === 0) return 'unknown_error';
    return erroredChecks
      .map(check =>
        [check.type, check.provider, check.errorReason ?? 'unknown_error']
          .filter(isDefined)
          .join('_')
      )
      .join(',');
  }

  private getLeatherApiUnavailableReason(error: unknown): LeatherApiUnavailableReason {
    if (LeatherApiError.isLeatherApiError(error)) return `leather_api_http_${error.status}`;
    if (isQueueTimeoutError(error)) return 'leather_api_timeout';
    if (error instanceof TypeError) {
      return isRuntimeOffline() ? offlineUnavailableReason : 'leather_api_network_error';
    }
    return 'leather_api_unknown_error';
  }
}
