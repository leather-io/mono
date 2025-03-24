import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_2_TAPROOT_ADDRESS,
} from '@leather.io/bitcoin';

import { checkEntityAddressIsCompliant, isAddressCompliant } from './compliance-checker';

// Mock axios
vi.mock('axios');

// Setup mock implementations before each test
beforeEach(() => {
  vi.mocked(axios.post).mockClear().mockResolvedValue({ data: {} });
  vi.mocked(axios.get).mockClear().mockResolvedValue({ data: {} });
});

describe('compliance-checker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should correctly identify a sanctioned address', async () => {
    // Mock the API responses with proper structure
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { success: true } });
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        risk: 'Severe',
      },
    });

    const address = TEST_ACCOUNT_2_TAPROOT_ADDRESS;
    const result = await checkEntityAddressIsCompliant({ address });

    // Verify API calls
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledTimes(1);

    // Verify result
    expect(result).toEqual({
      risk: 'Severe',
      isOnSanctionsList: true,
    });
  });

  it('should correctly identify a non-sanctioned address', async () => {
    // Mock the API responses
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { success: true } });
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        risk: 'Low',
      },
    });

    const address = TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS;
    const result = await checkEntityAddressIsCompliant({ address });

    // Verify API calls
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledTimes(1);

    // Verify result
    expect(result).toEqual({
      risk: 'Low',
      isOnSanctionsList: false,
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('API Error'));

    const address = '1ErrorAddressSample';

    await expect(checkEntityAddressIsCompliant({ address })).rejects.toThrow('API Error');

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('should make the correct API calls with the provided address', async () => {
    // Mock the API responses
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { success: true } });
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        risk: 'Medium',
      },
    });

    const address = TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS;
    await checkEntityAddressIsCompliant({ address });

    // Verify API calls with correct parameters
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.chainalysis.com/api/risk/v2/entities',
      { address },
      expect.any(Object)
    );

    expect(axios.get).toHaveBeenCalledWith(
      `https://api.chainalysis.com/api/risk/v2/entities/${address}`,
      expect.any(Object)
    );
  });
});

describe('isAddressCompliant', () => {
  it('should return true for a compliant address', async () => {
    const result = await isAddressCompliant({
      address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
      chain: 'mainnet',
    });
    expect(result).toBe(true);
  });

  it('should return false for an address on the sanctions list', async () => {
    // Mock the API responses
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { success: true } });
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        risk: 'Severe',
      },
    });

    const address = '1SanctionedAddressSample';
    const result = await isAddressCompliant({
      address,
      chain: 'mainnet',
    });

    expect(result).toBe(false);
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.chainalysis.com/api/risk/v2/entities',
      { address },
      expect.any(Object)
    );
    expect(axios.get).toHaveBeenCalledWith(
      `https://api.chainalysis.com/api/risk/v2/entities/${address}`,
      expect.any(Object)
    );
  });

  it('should return true for a non-mainnet chain', async () => {
    const result = await isAddressCompliant({
      address: '1AnyAddressSample',
      chain: 'testnet',
    });
    expect(result).toBe(true);
    expect(axios.post).not.toHaveBeenCalled();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('should return false if the compliance check fails', async () => {
    // Mock the API responses
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('API Error'));

    const address = '1ErrorAddressSample';
    const result = await isAddressCompliant({
      address,
      chain: 'mainnet',
    });

    expect(result).toBe(false);
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.chainalysis.com/api/risk/v2/entities',
      { address },
      expect.any(Object)
    );
    expect(axios.get).not.toHaveBeenCalled();
  });
});
