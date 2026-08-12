import { StxCallContractParams } from '~/utils/leather-sdk';

import {
  WalletProviderUnavailableError,
  connectWallet,
  isUserRejectionError,
  walletStxCallContract,
} from './wallet';

const { getLeatherMockModeMock, getSelectedProviderIdMock, getSelectedProviderMock, requestMock } =
  vi.hoisted(() => ({
    getLeatherMockModeMock: vi.fn(),
    getSelectedProviderIdMock: vi.fn(),
    getSelectedProviderMock: vi.fn(),
    requestMock: vi.fn(),
  }));

vi.mock('@stacks/connect', () => ({
  JsonRpcErrorCode: { UserRejection: -32000, UserCanceled: -31001 },
  disconnect: vi.fn(),
  getSelectedProvider: getSelectedProviderMock,
  getSelectedProviderId: getSelectedProviderIdMock,
  request: requestMock,
  setSelectedProviderId: vi.fn(),
}));

vi.mock('~/constants/environment', () => ({
  getLeatherMockMode: getLeatherMockModeMock,
}));

vi.mock('~/utils/leather-sdk', () => ({
  leather: {},
}));

const params: StxCallContractParams = {
  contract: 'SP000000000000000000002Q6VF78.pox-5',
  functionName: 'stake',
  functionArgs: [],
};

describe(connectWallet.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLeatherMockModeMock.mockReturnValue(false);
    getSelectedProviderIdMock.mockReturnValue(null);
  });

  test('requests addresses with explicit purposes so multi-vault wallets prompt for every chain', async () => {
    requestMock.mockResolvedValue({ addresses: [] });

    const result = await connectWallet();

    expect(requestMock).toHaveBeenCalledWith(
      { enableLocalStorage: false, forceWalletSelect: true },
      'getAddresses',
      { addresses: ['payment', 'ordinals', 'stacks'] }
    );
    expect(result).toEqual({ status: 'connected', addresses: [] });
  });

  test('classifies rejection-coded failures as canceled', async () => {
    requestMock.mockRejectedValue({ code: -31001 });

    const result = await connectWallet();

    expect(result).toEqual({ status: 'canceled', sessionRevoked: false });
  });

  test('classifies non-rejection failures as errors', async () => {
    const failure = new Error('provider exploded');
    requestMock.mockRejectedValue(failure);

    const result = await connectWallet();

    expect(result).toEqual({ status: 'error', error: failure, sessionRevoked: false });
  });
});

describe(isUserRejectionError.name, () => {
  beforeEach(() => {
    getLeatherMockModeMock.mockReturnValue(false);
    getSelectedProviderIdMock.mockReturnValue(null);
  });

  test('detects a rejection on both error shapes', () => {
    expect(isUserRejectionError({ code: 4001 })).toBe(true);
    expect(isUserRejectionError({ jsonrpc: '2.0', id: '1', error: { code: 4001 } })).toBe(true);
  });

  test('detects rejection codes from other wallets and the connect modal', () => {
    getSelectedProviderIdMock.mockReturnValue('XverseProviders.BitcoinProvider');

    expect(isUserRejectionError({ code: -32000 })).toBe(true);
    expect(isUserRejectionError({ code: -31001 })).toBe(true);
  });

  test('does not treat -32000 as a rejection when leather is the selected wallet', () => {
    getSelectedProviderIdMock.mockReturnValue('LeatherProvider');

    expect(isUserRejectionError({ code: -32000 })).toBe(false);
    expect(isUserRejectionError({ code: 4001 })).toBe(true);
    expect(isUserRejectionError({ code: -31001 })).toBe(true);
  });

  test('ignores anything else', () => {
    expect(isUserRejectionError({ code: -32603 })).toBe(false);
    expect(isUserRejectionError({ error: { code: -32603 } })).toBe(false);
    expect(isUserRejectionError(new Error('Mock Leather error'))).toBe(false);
    expect(isUserRejectionError(null)).toBe(false);
    expect(isUserRejectionError(undefined)).toBe(false);
  });
});

describe(walletStxCallContract.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLeatherMockModeMock.mockReturnValue(false);
  });

  test('throws without opening a wallet picker when no provider is selected', async () => {
    getSelectedProviderMock.mockReturnValue(undefined);

    await expect(walletStxCallContract(params)).rejects.toBeInstanceOf(
      WalletProviderUnavailableError
    );
    expect(requestMock).not.toHaveBeenCalled();
  });

  test('passes the selected provider explicitly so request cannot show the picker', async () => {
    const provider = { request: vi.fn() };
    getSelectedProviderMock.mockReturnValue(provider);
    requestMock.mockResolvedValue({ txid: 'abc' });

    const result = await walletStxCallContract(params);

    expect(requestMock).toHaveBeenCalledWith(
      { enableLocalStorage: false, provider },
      'stx_callContract',
      params
    );
    expect(result).toEqual({ txid: 'abc' });
  });

  test('rejects contract identifiers without a contract name', async () => {
    getSelectedProviderMock.mockReturnValue({ request: vi.fn() });

    await expect(
      walletStxCallContract({ ...params, contract: 'SP000000000000000000002Q6VF78' })
    ).rejects.toThrow('Invalid contract identifier');
    expect(requestMock).not.toHaveBeenCalled();
  });
});
