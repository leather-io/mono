import { StxCallContractParams } from '~/utils/leather-sdk';

import { WalletProviderUnavailableError, connectWallet, walletStxCallContract } from './wallet';

const { getLeatherMockModeMock, getSelectedProviderIdMock, getSelectedProviderMock, requestMock } =
  vi.hoisted(() => ({
    getLeatherMockModeMock: vi.fn(),
    getSelectedProviderIdMock: vi.fn(),
    getSelectedProviderMock: vi.fn(),
    requestMock: vi.fn(),
  }));

vi.mock('@stacks/connect', () => ({
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
