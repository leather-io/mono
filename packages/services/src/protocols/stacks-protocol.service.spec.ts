import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  LeatherApiClient,
  LeatherApiProtocol,
} from '../infrastructure/api/leather/leather-api.client';
import { StacksProtocolService } from './stacks-protocol.service';

const mockProtocols: Record<string, LeatherApiProtocol> = {
  alex: {
    id: 'alex',
    name: 'Alex',
    url: 'https://alexlab.co',
    logo: 'https://alexlab.co/logo.png',
    description: 'Alex DEX',
    addresses: ['SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM'],
  },
  bitflow: {
    id: 'bitflow',
    name: 'Bitflow',
    url: 'https://bitflow.finance',
    logo: 'https://bitflow.finance/logo.png',
    description: 'Bitflow DEX',
    addresses: [
      'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR',
      'SP2C2YFP12AJZB1MADC68RTAJ4QR4EWMHV4VG3M5M',
    ],
  },
};

const mockContractMap = {
  'swap-helper-v1-03': {
    swap: 'swap',
  },
  'amm-pool-v2-01': {
    'add-liquidity': 'add-liquidity',
    'remove-liquidity': 'remove-liquidity',
  },
};

describe(StacksProtocolService.name, () => {
  const mockLeatherApiClient = {
    fetchProtocols: vi.fn().mockResolvedValue(mockProtocols),
    fetchProtocolContracts: vi.fn().mockResolvedValue(mockContractMap),
  } as unknown as LeatherApiClient;

  const service = new StacksProtocolService(mockLeatherApiClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe(StacksProtocolService.prototype.getProtocols.name, () => {
    it('returns all protocols mapped from API response', async () => {
      const result = await service.getProtocols();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'alex',
        name: 'Alex',
        url: 'https://alexlab.co',
        logo: 'https://alexlab.co/logo.png',
        description: 'Alex DEX',
      });
    });
  });

  describe(StacksProtocolService.prototype.getProtocolById.name, () => {
    it('returns protocol matching the given id', async () => {
      const result = await service.getProtocolById('bitflow');

      expect(result).toEqual({
        id: 'bitflow',
        name: 'Bitflow',
        url: 'https://bitflow.finance',
        logo: 'https://bitflow.finance/logo.png',
        description: 'Bitflow DEX',
      });
    });

    it('returns null for unknown id', async () => {
      const result = await service.getProtocolById('zest');
      expect(result).toBeNull();
    });
  });

  describe(StacksProtocolService.prototype.getProtocolByAddress.name, () => {
    it('returns protocol matching the given deployer address', async () => {
      const result = await service.getProtocolByAddress('SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR');

      expect(result).toEqual(expect.objectContaining({ id: 'bitflow', name: 'Bitflow' }));
    });

    it('returns null for unknown address', async () => {
      const result = await service.getProtocolByAddress('SP_UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe(StacksProtocolService.prototype.getContractActionType.name, () => {
    it('returns action type for known contract and function', async () => {
      const result = await service.getContractActionType('alex', 'swap-helper-v1-03', 'swap');
      expect(result).toBe('swap');
    });

    it('returns action type for nested contract lookup', async () => {
      const result = await service.getContractActionType('alex', 'amm-pool-v2-01', 'add-liquidity');
      expect(result).toBe('add-liquidity');
    });

    it('returns null for unknown contract name', async () => {
      const result = await service.getContractActionType('alex', 'unknown-contract', 'swap');
      expect(result).toBeNull();
    });

    it('returns null for unknown function name', async () => {
      const result = await service.getContractActionType('alex', 'swap-helper-v1-03', 'unknown-fn');
      expect(result).toBeNull();
    });
  });
});
