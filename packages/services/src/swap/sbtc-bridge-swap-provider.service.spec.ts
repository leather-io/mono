import { ClarityType, type ClarityValue } from '@stacks/transactions';
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import type { EmilyApiClient } from '../infrastructure/api/emily/emily-api.client';
import type { EmilyDepositRequest } from '../infrastructure/api/emily/emily-api.types';
import type { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import type { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { SbtcBridgeSwapProviderService } from './sbtc-bridge-swap-provider.service';

vi.mock('@leather.io/utils', async () => ({
  ...(await vi.importActual('@leather.io/utils')),
  delay: () => Promise.resolve(),
}));

const xOnlySignersPublicKey = '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';
const compressedSignersPublicKey = `02${xOnlySignersPublicKey}`;

const depositRequest: EmilyDepositRequest = {
  bitcoinTxid: 'a'.repeat(64),
  bitcoinTxOutputIndex: 0,
  depositScript: 'deposit-script',
  reclaimScript: 'reclaim-script',
  transactionHex: 'tx-hex',
};

function createAxiosError(status: number | undefined, data?: unknown, message = 'Request failed') {
  const response: AxiosResponse | undefined =
    status === undefined
      ? undefined
      : { data, status, statusText: '', headers: {}, config: { headers: new AxiosHeaders() } };
  return new AxiosError(
    message,
    status === undefined ? 'ECONNABORTED' : 'ERR_BAD_RESPONSE',
    undefined,
    undefined,
    response
  );
}

function makeService({
  notifyDeposit = vi.fn().mockResolvedValue(undefined),
  callReadOnlyFunction = vi.fn(),
}: {
  notifyDeposit?: ReturnType<typeof vi.fn>;
  callReadOnlyFunction?: ReturnType<typeof vi.fn>;
} = {}) {
  const leatherApiClient = {} as unknown as LeatherApiClient;
  const emilyApiClient = { notifyDeposit } as unknown as EmilyApiClient;
  const stacksApiClient = { callReadOnlyFunction } as unknown as HiroStacksApiClient;
  const settingsService = {
    getSettings: () => ({ network: { chain: { bitcoin: { mode: 'mainnet' } } } }),
  } as unknown as SettingsService;
  return {
    service: new SbtcBridgeSwapProviderService(
      leatherApiClient,
      emilyApiClient,
      stacksApiClient,
      settingsService
    ),
    notifyDeposit,
    callReadOnlyFunction,
  };
}

describe(SbtcBridgeSwapProviderService.name, () => {
  describe('notifyDeposit', () => {
    it('resolves notified on success', async () => {
      const { service, notifyDeposit } = makeService();

      const result = await service.notifyDeposit(depositRequest);

      expect(result).toEqual({ status: 'notified' });
      expect(notifyDeposit).toHaveBeenCalledTimes(1);
      expect(notifyDeposit).toHaveBeenCalledWith(depositRequest);
    });

    it('fails fast without retrying on 4xx', async () => {
      const { service, notifyDeposit } = makeService({
        notifyDeposit: vi
          .fn()
          .mockRejectedValue(createAxiosError(400, { message: 'Invalid request body' })),
      });

      const result = await service.notifyDeposit(depositRequest);

      expect(result).toEqual({
        status: 'failed',
        errorMessage: 'Invalid request body',
        httpStatus: 400,
      });
      expect(notifyDeposit).toHaveBeenCalledTimes(1);
    });

    it('retries 5xx up to three attempts then fails', async () => {
      const { service, notifyDeposit } = makeService({
        notifyDeposit: vi
          .fn()
          .mockRejectedValue(createAxiosError(503, { message: 'Service unavailable' })),
      });

      const result = await service.notifyDeposit(depositRequest);

      expect(result).toEqual({
        status: 'failed',
        errorMessage: 'Service unavailable',
        httpStatus: 503,
      });
      expect(notifyDeposit).toHaveBeenCalledTimes(3);
    });

    it('retries timeouts up to three attempts then fails without an http status', async () => {
      const { service, notifyDeposit } = makeService({
        notifyDeposit: vi
          .fn()
          .mockRejectedValue(createAxiosError(undefined, undefined, 'timeout of 10000ms exceeded')),
      });

      const result = await service.notifyDeposit(depositRequest);

      expect(result).toEqual({ status: 'failed', errorMessage: 'timeout of 10000ms exceeded' });
      expect(notifyDeposit).toHaveBeenCalledTimes(3);
    });

    it('resolves notified when a retry succeeds', async () => {
      const { service, notifyDeposit } = makeService({
        notifyDeposit: vi
          .fn()
          .mockRejectedValueOnce(createAxiosError(502, { message: 'Bad gateway' }))
          .mockResolvedValue(undefined),
      });

      const result = await service.notifyDeposit(depositRequest);

      expect(result).toEqual({ status: 'notified' });
      expect(notifyDeposit).toHaveBeenCalledTimes(2);
    });
  });

  describe('getSignersPublicKey', () => {
    it('reads the compressed aggregate pubkey from sbtc-registry and returns it x-only', async () => {
      const bufferCv: ClarityValue = {
        type: ClarityType.Buffer,
        value: compressedSignersPublicKey,
      };
      const { service, callReadOnlyFunction } = makeService({
        callReadOnlyFunction: vi.fn().mockResolvedValue(bufferCv),
      });

      const result = await service.getSignersPublicKey();

      expect(result).toBe(xOnlySignersPublicKey);
      expect(result).toHaveLength(64);
      expect(callReadOnlyFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          contractAddress: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4',
          contractName: 'sbtc-registry',
          functionName: 'get-current-aggregate-pubkey',
        }),
        expect.anything()
      );
    });

    it('rejects when the contract returns a non-buffer value', async () => {
      const { service } = makeService({
        callReadOnlyFunction: vi.fn().mockResolvedValue({ type: ClarityType.BoolTrue }),
      });

      await expect(service.getSignersPublicKey()).rejects.toThrowError(
        'Unexpected response from sbtc-registry get-current-aggregate-pubkey'
      );
    });
  });
});
