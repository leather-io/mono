import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@leather.io/query', () => ({
  defaultStacksFees: { estimates: [] },
  isAddressCompliant: vi.fn(),
}));

import { addressComplianceValidator } from '@/features/send/utils';
import { isAddressCompliant } from '@leather.io/query';

const memoizedValidator = addressComplianceValidator as typeof addressComplianceValidator & {
  clear?: () => void;
};

describe('addressComplianceValidator', () => {
  beforeEach(() => {
    vi.mocked(isAddressCompliant).mockReset();
    memoizedValidator.clear?.();
  });

  afterEach(() => {
    memoizedValidator.clear?.();
  });

  it('memoizes identical compliance lookups', async () => {
    vi.mocked(isAddressCompliant).mockResolvedValue(true);

    await addressComplianceValidator({
      address: 'addr',
      chain: 'mainnet',
      shouldCheckCompliance: true,
    });
    await addressComplianceValidator({
      address: 'addr',
      chain: 'mainnet',
      shouldCheckCompliance: true,
    });

    expect(isAddressCompliant).toHaveBeenCalledTimes(1);
  });

  it('revalidates when chain changes', async () => {
    vi.mocked(isAddressCompliant).mockResolvedValue(true);

    await addressComplianceValidator({
      address: 'addr',
      chain: 'testnet',
      shouldCheckCompliance: true,
    });
    await addressComplianceValidator({
      address: 'addr',
      chain: 'mainnet',
      shouldCheckCompliance: true,
    });

    expect(isAddressCompliant).toHaveBeenCalledTimes(2);
  });

  it('revalidates when compliance flag changes', async () => {
    vi.mocked(isAddressCompliant).mockResolvedValue(true);

    await addressComplianceValidator({
      address: 'addr',
      chain: 'mainnet',
      shouldCheckCompliance: false,
    });

    expect(isAddressCompliant).not.toHaveBeenCalled();

    await addressComplianceValidator({
      address: 'addr',
      chain: 'mainnet',
      shouldCheckCompliance: true,
    });

    expect(isAddressCompliant).toHaveBeenCalledTimes(1);
  });
});
