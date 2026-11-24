import { beforeEach, describe, expect, test, vi } from 'vitest';

import { logger } from '@shared/logger';

import { parseMonitoredAddresses } from './address-monitor';

vi.mock('@shared/logger', () => ({
  logger: { warn: vi.fn() },
}));

vi.mock('./address-monitors/bitcoin-transaction-monitor', () => ({
  createBitcoinTransactionMonitor: vi.fn(),
}));

const validAddress = {
  chain: 'bitcoin',
  accountIndex: 0,
  isCurrent: true,
  address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
};

describe(parseMonitoredAddresses.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('keeps valid entries and drops invalid ones with a warning', () => {
    const addresses = parseMonitoredAddresses([
      validAddress,
      { ...validAddress, accountIndex: Number.NaN },
      { ...validAddress, chain: 'solana' },
    ]);

    expect(addresses).toEqual([validAddress]);
    expect(logger.warn).toHaveBeenCalledTimes(2);
  });

  test('returns an empty list without a warning when nothing is stored', () => {
    expect(parseMonitoredAddresses(undefined)).toEqual([]);
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
