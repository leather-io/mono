import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import { compileWshDescriptor } from '@leather.io/bitcoin';
import { RpcErrorCode, createRpcErrorResponse, createRpcSuccessResponse } from '@leather.io/rpc';
import { createMoney } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { RpcErrorMessage } from '@shared/rpc/methods/validation.utils';

import { useRpcSignPsbt } from './use-rpc-sign-psbt';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  closeWindow: vi.fn(),
  track: vi.fn(),
  sendMessage: vi.fn(),
  useRpcSignPsbtParams: vi.fn(),
  useDescriptorPsbtDetails: vi.fn(),
  useCryptoCurrencyMarketDataMeanAverage: vi.fn(),
  calculateBitcoinFiatValue: vi.fn(),
  getDefaultSigningConfig: vi.fn(),
  signDescriptorPsbt: vi.fn(),
  signPsbt: vi.fn(),
  getPsbtAsTransaction: vi.fn(),
  broadcastTx: vi.fn(),
  refetchUtxos: vi.fn(),
}));

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('@shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('@shared/utils')>();
  return { ...actual, closeWindow: mocks.closeWindow };
});

vi.mock('@shared/utils/analytics', () => ({
  analytics: { track: mocks.track },
}));

vi.mock('@app/common/currency-formatter', () => ({
  formatCurrency: () => 'formatted',
}));

vi.mock('@app/common/psbt/use-psbt-request-params', () => ({
  useRpcSignPsbtParams: mocks.useRpcSignPsbtParams,
}));

vi.mock('@app/features/psbt-signer/hooks/use-descriptor-psbt-details', () => ({
  useDescriptorPsbtDetails: mocks.useDescriptorPsbtDetails,
}));

vi.mock('@app/features/psbt-signer/hooks/use-psbt-signer', () => ({
  usePsbtSigner: () => ({
    signPsbt: mocks.signPsbt,
    getPsbtAsTransaction: mocks.getPsbtAsTransaction,
  }),
}));

vi.mock('@app/query/bitcoin/transaction/use-bitcoin-broadcast-transaction', () => ({
  useBitcoinBroadcastTransaction: () => ({
    broadcastTx: mocks.broadcastTx,
    isBroadcasting: false,
  }),
}));

vi.mock('@app/query/bitcoin/utxos/utxos.hooks', () => ({
  useCurrentUtxos: () => ({ refetchUtxos: mocks.refetchUtxos }),
}));

vi.mock('@app/query/common/market-data/market-data.hooks', () => ({
  useCryptoCurrencyMarketDataMeanAverage: mocks.useCryptoCurrencyMarketDataMeanAverage,
  useCalculateBitcoinFiatValue: () => mocks.calculateBitcoinFiatValue,
}));

vi.mock('@app/store/accounts/blockchain/bitcoin/bitcoin.hooks', () => ({
  useGetAssumedZeroIndexSigningConfig: () => mocks.getDefaultSigningConfig,
}));

vi.mock('./descriptor-psbt.hooks', () => ({
  useSignDescriptorPsbt: () => mocks.signDescriptorPsbt,
}));

interface MockBroadcastTxArgs {
  tx: string;
  skipTaprootWarning?: boolean;
  onSuccess?(txid: string): void | Promise<void>;
  onError?(error: Error): void;
}

function requireBytes(bytes: Uint8Array | null) {
  if (!bytes) throw new Error('Expected key bytes to be defined');
  return bytes;
}

function makeNativeSegwitAccountXpub(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'")
    .publicExtendedKey;
}

function deriveAddressIndexKey(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte))
    .derive("m/84'/0'/0'")
    .deriveChild(0)
    .deriveChild(0);
}

const xpubA = makeNativeSegwitAccountXpub(1);
const xpubB = makeNativeSegwitAccountXpub(2);
const singleSigDescriptor = `wsh(pk(${xpubA}/0/0))`;
const multiSigDescriptor = `wsh(multi(2,${xpubB}/0/0,${xpubA}/0/0))`;
const requestId = 'request-id';
const origin = 'https://example.com';
const tabId = 7;

function buildPolicyTx(descriptor: string, signWith: number[]) {
  const { scriptPubKey, witnessScript } = compileWshDescriptor(descriptor);
  const tx = new btc.Transaction({ allowUnknownInputs: true });
  tx.addInput({
    txid: hexToBytes('00'.repeat(32)),
    index: 0,
    witnessUtxo: { script: scriptPubKey, amount: 20_000n },
    witnessScript,
  });
  tx.addOutput({
    script: btc.p2wpkh(requireBytes(deriveAddressIndexKey(3).publicKey)).script,
    amount: 18_000n,
  });
  for (const seedByte of signWith)
    tx.signIdx(requireBytes(deriveAddressIndexKey(seedByte).privateKey), 0);
  return tx;
}

function buildTransferTx({ signed }: { signed: boolean }) {
  const key = deriveAddressIndexKey(5);
  const tx = new btc.Transaction();
  tx.addInput({
    txid: hexToBytes('22'.repeat(32)),
    index: 0,
    witnessUtxo: { script: btc.p2wpkh(requireBytes(key.publicKey)).script, amount: 20_000n },
  });
  tx.addOutput({
    script: btc.p2wpkh(requireBytes(deriveAddressIndexKey(6).publicKey)).script,
    amount: 18_000n,
  });
  if (signed) tx.sign(requireBytes(key.privateKey));
  return tx;
}

function setRpcSignPsbtParams({
  broadcast,
  descriptor,
  psbtHex,
}: {
  broadcast: boolean;
  descriptor?: string;
  psbtHex: string;
}) {
  mocks.useRpcSignPsbtParams.mockReturnValue({
    broadcast,
    descriptor,
    origin,
    psbtHex,
    requestId,
    signAtIndex: undefined,
    tabId,
  });
}

function mockBroadcastSuccess(txid: string) {
  const broadcastedTxs: string[] = [];
  mocks.broadcastTx.mockImplementation(async ({ tx, onSuccess }: MockBroadcastTxArgs) => {
    broadcastedTxs.push(tx);
    await onSuccess?.(txid);
    return txid;
  });
  return broadcastedTxs;
}

const transferTotals = {
  addressNativeSegwitTotal: createMoney(18_000, 'BTC'),
  addressTaprootTotal: createMoney(0, 'BTC'),
  fee: createMoney(2_000, 'BTC'),
};

describe(useRpcSignPsbt.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('chrome', { tabs: { sendMessage: mocks.sendMessage } });
    mocks.useDescriptorPsbtDetails.mockReturnValue(null);
    mocks.refetchUtxos.mockResolvedValue(undefined);
    mocks.useCryptoCurrencyMarketDataMeanAverage.mockReturnValue({
      price: createMoney(0, 'USD'),
    });
    mocks.calculateBitcoinFiatValue.mockReturnValue(createMoney(0, 'USD'));
    mocks.getDefaultSigningConfig.mockReturnValue([]);
  });

  test('throws when required request params are missing', () => {
    mocks.useRpcSignPsbtParams.mockReturnValue({
      broadcast: false,
      descriptor: undefined,
      origin,
      psbtHex: null,
      requestId,
      signAtIndex: undefined,
      tabId,
    });
    expect(() => useRpcSignPsbt()).toThrow('Invalid params in useRpcSignPsbt');
  });

  test('finalizes and broadcasts a descriptor psbt when the policy is satisfiable', async () => {
    const psbtHex = bytesToHex(buildPolicyTx(singleSigDescriptor, []).toPSBT());
    const signedTx = buildPolicyTx(singleSigDescriptor, [1]);
    const signedPsbtHex = bytesToHex(signedTx.toPSBT());
    setRpcSignPsbtParams({ broadcast: true, descriptor: singleSigDescriptor, psbtHex });
    mocks.signDescriptorPsbt.mockResolvedValue(signedTx);
    const broadcastedTxs = mockBroadcastSuccess('txid-123');

    await useRpcSignPsbt().onSignPsbt({ inputs: [] });

    expect(mocks.signDescriptorPsbt).toHaveBeenCalledWith(psbtHex, singleSigDescriptor);
    expect(mocks.track).toHaveBeenCalledWith('user_approved_sign_and_broadcast_psbt', { origin });
    expect(broadcastedTxs).toHaveLength(1);
    const decoded = btc.Transaction.fromRaw(hexToBytes(broadcastedTxs[0]), {
      allowUnknownInputs: true,
    });
    expect(decoded.getInput(0).finalScriptWitness?.length).toBeGreaterThan(0);
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcSuccessResponse('signPsbt', {
        id: requestId,
        result: { hex: signedPsbtHex, txid: 'txid-123' },
      })
    );
    expect(mocks.refetchUtxos).toHaveBeenCalled();
    expect(mocks.navigate).toHaveBeenCalledWith(
      RouteUrls.RpcSignPsbtSummary,
      expect.objectContaining({ state: expect.objectContaining({ txId: 'txid-123' }) })
    );
    expect(mocks.closeWindow).not.toHaveBeenCalled();
  });

  test('falls back to returning the partially signed psbt when the policy cannot be satisfied', async () => {
    const psbtHex = bytesToHex(buildPolicyTx(multiSigDescriptor, []).toPSBT());
    const signedTx = buildPolicyTx(multiSigDescriptor, [1]);
    const signedPsbtHex = bytesToHex(signedTx.toPSBT());
    setRpcSignPsbtParams({ broadcast: true, descriptor: multiSigDescriptor, psbtHex });
    mocks.signDescriptorPsbt.mockResolvedValue(signedTx);

    await useRpcSignPsbt().onSignPsbt({ inputs: [] });

    expect(mocks.broadcastTx).not.toHaveBeenCalled();
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcSuccessResponse('signPsbt', {
        id: requestId,
        result: { hex: signedPsbtHex },
      })
    );
    expect(mocks.closeWindow).toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  test('returns the signed descriptor psbt without broadcasting when broadcast is not requested', async () => {
    const psbtHex = bytesToHex(buildPolicyTx(singleSigDescriptor, []).toPSBT());
    const signedTx = buildPolicyTx(singleSigDescriptor, [1]);
    const signedPsbtHex = bytesToHex(signedTx.toPSBT());
    setRpcSignPsbtParams({ broadcast: false, descriptor: singleSigDescriptor, psbtHex });
    mocks.signDescriptorPsbt.mockResolvedValue(signedTx);

    await useRpcSignPsbt().onSignPsbt({ inputs: [] });

    expect(mocks.broadcastTx).not.toHaveBeenCalled();
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcSuccessResponse('signPsbt', {
        id: requestId,
        result: { hex: signedPsbtHex },
      })
    );
    expect(mocks.closeWindow).toHaveBeenCalled();
  });

  test('responds with an error and navigates when descriptor signing fails', async () => {
    const psbtHex = bytesToHex(buildPolicyTx(singleSigDescriptor, []).toPSBT());
    setRpcSignPsbtParams({ broadcast: true, descriptor: singleSigDescriptor, psbtHex });
    mocks.signDescriptorPsbt.mockRejectedValue(new Error('Ledger rejected'));

    await useRpcSignPsbt().onSignPsbt({ inputs: [] });

    expect(mocks.broadcastTx).not.toHaveBeenCalled();
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcErrorResponse('signPsbt', {
        id: requestId,
        error: {
          code: RpcErrorCode.INVALID_REQUEST,
          message: RpcErrorMessage.UnsignedTransaction,
        },
      })
    );
    expect(mocks.navigate).toHaveBeenCalledWith(RouteUrls.RequestError, {
      state: { message: 'Ledger rejected', title: 'Failed to sign' },
    });
  });

  test('responds with the signed psbt in the error payload when broadcast fails', async () => {
    const psbtHex = bytesToHex(buildPolicyTx(singleSigDescriptor, []).toPSBT());
    const signedTx = buildPolicyTx(singleSigDescriptor, [1]);
    const signedPsbtHex = bytesToHex(signedTx.toPSBT());
    setRpcSignPsbtParams({ broadcast: true, descriptor: singleSigDescriptor, psbtHex });
    mocks.signDescriptorPsbt.mockResolvedValue(signedTx);
    mocks.broadcastTx.mockImplementation(({ onError }: MockBroadcastTxArgs) =>
      onError?.(new Error('mempool rejected'))
    );

    await useRpcSignPsbt().onSignPsbt({ inputs: [] });

    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcErrorResponse('signPsbt', {
        id: requestId,
        error: {
          code: 4002,
          message: 'Failed to broadcast transaction',
          data: { hex: signedPsbtHex },
        },
      })
    );
    expect(mocks.navigate).toHaveBeenCalledWith(RouteUrls.RequestError, {
      state: { message: 'mempool rejected', title: 'Failed to broadcast' },
    });
  });

  test('finalizes and broadcasts a fully signed non-descriptor psbt', async () => {
    const psbtHex = bytesToHex(buildTransferTx({ signed: false }).toPSBT());
    const signedTx = buildTransferTx({ signed: true });
    const signedPsbtHex = bytesToHex(signedTx.toPSBT());
    setRpcSignPsbtParams({ broadcast: true, psbtHex });
    mocks.getPsbtAsTransaction.mockImplementation((hex: string) =>
      btc.Transaction.fromPSBT(hexToBytes(hex))
    );
    mocks.signPsbt.mockResolvedValue(signedTx);
    const broadcastedTxs = mockBroadcastSuccess('txid-456');

    await useRpcSignPsbt().onSignPsbt({ inputs: [], ...transferTotals });

    expect(broadcastedTxs).toEqual([signedTx.hex]);
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcSuccessResponse('signPsbt', {
        id: requestId,
        result: { hex: signedPsbtHex, txid: 'txid-456' },
      })
    );
    expect(mocks.navigate).toHaveBeenCalledWith(
      RouteUrls.RpcSignPsbtSummary,
      expect.objectContaining({ state: expect.objectContaining({ txId: 'txid-456' }) })
    );
  });

  test('navigates to an error when the non-descriptor psbt cannot be finalized', async () => {
    const psbtHex = bytesToHex(buildTransferTx({ signed: false }).toPSBT());
    setRpcSignPsbtParams({ broadcast: true, psbtHex });
    mocks.getPsbtAsTransaction.mockImplementation((hex: string) =>
      btc.Transaction.fromPSBT(hexToBytes(hex))
    );
    mocks.signPsbt.mockResolvedValue(buildTransferTx({ signed: false }));

    await useRpcSignPsbt().onSignPsbt({ inputs: [], ...transferTotals });

    expect(mocks.broadcastTx).not.toHaveBeenCalled();
    expect(mocks.sendMessage).not.toHaveBeenCalled();
    expect(mocks.navigate).toHaveBeenCalledWith(
      RouteUrls.RequestError,
      expect.objectContaining({
        state: expect.objectContaining({ title: 'Failed to finalize tx' }),
      })
    );
  });

  test('sends no response at all when broadcast is requested without transfer totals', async () => {
    const psbtHex = bytesToHex(buildTransferTx({ signed: false }).toPSBT());
    setRpcSignPsbtParams({ broadcast: true, psbtHex });
    mocks.getPsbtAsTransaction.mockImplementation((hex: string) =>
      btc.Transaction.fromPSBT(hexToBytes(hex))
    );
    mocks.signPsbt.mockResolvedValue(buildTransferTx({ signed: true }));

    await useRpcSignPsbt().onSignPsbt({ inputs: [] });

    expect(mocks.broadcastTx).not.toHaveBeenCalled();
    expect(mocks.sendMessage).not.toHaveBeenCalled();
    expect(mocks.closeWindow).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  test('rejects the request when the user cancels', () => {
    const psbtHex = bytesToHex(buildTransferTx({ signed: false }).toPSBT());
    setRpcSignPsbtParams({ broadcast: false, psbtHex });

    useRpcSignPsbt().onCancel();

    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcErrorResponse('signPsbt', {
        id: requestId,
        error: {
          code: RpcErrorCode.USER_REJECTION,
          message: 'User rejected signing PSBT request',
        },
      })
    );
    expect(mocks.closeWindow).toHaveBeenCalled();
  });
});
