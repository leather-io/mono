import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import { compileWshDescriptor, psbtHexToBase64 } from '@leather.io/bitcoin';
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
  useBondProposalRoute: vi.fn(),
  proposeMultisigTransaction: vi.fn(),
  useCurrentAccountNativeSegwitIndexZeroPayer: vi.fn(),
  useCurrentAccountTaprootIndexZeroPayer: vi.fn(),
  useCurrentNetwork: vi.fn(),
}));

vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useEffect(effect: () => void) {
      effect();
    },
    useMemo<T>(factory: () => T) {
      return factory();
    },
  };
});

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('./use-bond-proposal-route', () => ({
  useBondProposalRoute: mocks.useBondProposalRoute,
}));

vi.mock('@app/features/multisig/use-propose-multisig-transaction', () => ({
  useProposeMultisigTransaction: () => ({
    proposeMultisigTransaction: mocks.proposeMultisigTransaction,
    isProposing: false,
  }),
}));

vi.mock('@app/store/networks/networks.selectors', async importOriginal => {
  const actual = await importOriginal<typeof import('@app/store/networks/networks.selectors')>();
  return { ...actual, useCurrentNetwork: mocks.useCurrentNetwork };
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

vi.mock('@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks', () => ({
  useCurrentAccountNativeSegwitIndexZeroPayer: mocks.useCurrentAccountNativeSegwitIndexZeroPayer,
}));

vi.mock('@app/store/accounts/blockchain/bitcoin/taproot-account.hooks', () => ({
  useCurrentAccountTaprootIndexZeroPayer: mocks.useCurrentAccountTaprootIndexZeroPayer,
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
const timelockDescriptor = `wsh(and_v(v:after(1000),pk(${xpubA}/0/0)))`;
const requestId = 'request-id';
const origin = 'https://example.com';
const frameId = 42;
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
  allowedSighash,
  broadcast,
  descriptor,
  psbtHex,
}: {
  allowedSighash?: number[];
  broadcast: boolean;
  descriptor?: string;
  psbtHex: string;
}) {
  mocks.useRpcSignPsbtParams.mockReturnValue({
    allowedSighash,
    broadcast,
    descriptor,
    frameId,
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

const transferInputAddress =
  btc.p2wpkh(requireBytes(deriveAddressIndexKey(5).publicKey)).address ?? '';

function buildDisallowedSighashTx(sighashType: number) {
  const key = deriveAddressIndexKey(5);
  const tx = new btc.Transaction();
  tx.addInput({
    txid: hexToBytes('22'.repeat(32)),
    index: 0,
    witnessUtxo: { script: btc.p2wpkh(requireBytes(key.publicKey)).script, amount: 20_000n },
    sighashType,
  });
  tx.addOutput({
    script: btc.p2wpkh(requireBytes(deriveAddressIndexKey(6).publicKey)).script,
    amount: 18_000n,
  });
  return tx;
}

describe(useRpcSignPsbt.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('chrome', { tabs: { sendMessage: mocks.sendMessage } });
    mocks.sendMessage.mockResolvedValue(undefined);
    mocks.useDescriptorPsbtDetails.mockReturnValue(null);
    mocks.refetchUtxos.mockResolvedValue(undefined);
    mocks.useCryptoCurrencyMarketDataMeanAverage.mockReturnValue({
      price: createMoney(0, 'USD'),
    });
    mocks.calculateBitcoinFiatValue.mockReturnValue(createMoney(0, 'USD'));
    mocks.getDefaultSigningConfig.mockReturnValue([]);
    mocks.getPsbtAsTransaction.mockImplementation((hex: string) =>
      btc.Transaction.fromPSBT(hexToBytes(hex))
    );
    mocks.useBondProposalRoute.mockReturnValue(null);
    mocks.useCurrentAccountNativeSegwitIndexZeroPayer.mockReturnValue({
      address: transferInputAddress,
    });
    mocks.useCurrentAccountTaprootIndexZeroPayer.mockReturnValue({ address: '' });
    mocks.useCurrentNetwork.mockReturnValue({
      id: 'mainnet',
      chain: { bitcoin: { mode: 'mainnet' } },
    });
  });

  test('throws when required request params are missing', () => {
    mocks.useRpcSignPsbtParams.mockReturnValue({
      broadcast: false,
      descriptor: undefined,
      frameId,
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
      }),
      { frameId }
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
      }),
      { frameId }
    );
    expect(mocks.closeWindow).toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  test('falls back to returning the partially signed psbt when the tx cannot satisfy the descriptor timelock', async () => {
    const psbtHex = bytesToHex(buildPolicyTx(timelockDescriptor, []).toPSBT());
    const signedTx = buildPolicyTx(timelockDescriptor, [1]);
    const signedPsbtHex = bytesToHex(signedTx.toPSBT());
    setRpcSignPsbtParams({ broadcast: true, descriptor: timelockDescriptor, psbtHex });
    mocks.signDescriptorPsbt.mockResolvedValue(signedTx);

    await useRpcSignPsbt().onSignPsbt({ inputs: [] });

    expect(mocks.broadcastTx).not.toHaveBeenCalled();
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcSuccessResponse('signPsbt', {
        id: requestId,
        result: { hex: signedPsbtHex },
      }),
      { frameId }
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
      }),
      { frameId }
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
      }),
      { frameId }
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
      }),
      { frameId }
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
    mocks.signPsbt.mockResolvedValue(signedTx);
    const broadcastedTxs = mockBroadcastSuccess('txid-456');

    await useRpcSignPsbt().onSignPsbt({ inputs: [], ...transferTotals });

    expect(broadcastedTxs).toEqual([signedTx.hex]);
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcSuccessResponse('signPsbt', {
        id: requestId,
        result: { hex: signedPsbtHex, txid: 'txid-456' },
      }),
      { frameId }
    );
    expect(mocks.navigate).toHaveBeenCalledWith(
      RouteUrls.RpcSignPsbtSummary,
      expect.objectContaining({ state: expect.objectContaining({ txId: 'txid-456' }) })
    );
  });

  test('navigates to an error when the non-descriptor psbt cannot be finalized', async () => {
    const psbtHex = bytesToHex(buildTransferTx({ signed: false }).toPSBT());
    setRpcSignPsbtParams({ broadcast: true, psbtHex });
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
    mocks.signPsbt.mockResolvedValue(buildTransferTx({ signed: true }));

    await useRpcSignPsbt().onSignPsbt({ inputs: [] });

    expect(mocks.broadcastTx).not.toHaveBeenCalled();
    expect(mocks.sendMessage).not.toHaveBeenCalled();
    expect(mocks.closeWindow).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  test('rejects signing when an input to sign carries a disallowed sighash', async () => {
    const psbtHex = bytesToHex(buildDisallowedSighashTx(btc.SigHash.NONE).toPSBT());
    setRpcSignPsbtParams({ broadcast: false, psbtHex });
    const { hasDisallowedSighash, onSignPsbt } = useRpcSignPsbt();

    expect(hasDisallowedSighash).toBe(true);

    await onSignPsbt({ inputs: [] });

    expect(mocks.signPsbt).not.toHaveBeenCalled();
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcErrorResponse('signPsbt', {
        id: requestId,
        error: {
          code: RpcErrorCode.INVALID_PARAMS,
          message: RpcErrorMessage.DisallowedSighash,
        },
      }),
      { frameId }
    );
    expect(mocks.navigate).toHaveBeenCalledWith(
      RouteUrls.RequestError,
      expect.objectContaining({
        state: expect.objectContaining({ title: 'Signing not permitted' }),
      })
    );
  });

  test('signs when the request opts into the sighash type through allowedSighash', async () => {
    const psbtHex = bytesToHex(buildDisallowedSighashTx(btc.SigHash.NONE).toPSBT());
    setRpcSignPsbtParams({ allowedSighash: [btc.SigHash.NONE], broadcast: false, psbtHex });
    const signedTx = buildTransferTx({ signed: true });
    const signedPsbtHex = bytesToHex(signedTx.toPSBT());
    mocks.signPsbt.mockResolvedValue(signedTx);

    const { hasDisallowedSighash, onSignPsbt } = useRpcSignPsbt();

    expect(hasDisallowedSighash).toBe(false);

    await onSignPsbt({ inputs: [] });

    expect(mocks.signPsbt).toHaveBeenCalledWith(
      expect.objectContaining({ allowedSighash: [btc.SigHash.NONE] })
    );
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcSuccessResponse('signPsbt', {
        id: requestId,
        result: { hex: signedPsbtHex },
      }),
      { frameId }
    );
  });

  test('ignores a disallowed sighash on inputs the wallet does not own', () => {
    const psbtHex = bytesToHex(buildDisallowedSighashTx(btc.SigHash.NONE).toPSBT());
    setRpcSignPsbtParams({ broadcast: false, psbtHex });
    mocks.useCurrentAccountNativeSegwitIndexZeroPayer.mockReturnValue({
      address: 'bc1qunrelatedaddress',
    });

    const { hasDisallowedSighash } = useRpcSignPsbt();

    expect(hasDisallowedSighash).toBe(false);
  });

  test('rejects a descriptor psbt with a disallowed sighash regardless of allowedSighash', () => {
    const psbtHex = bytesToHex(buildPolicyTx(singleSigDescriptor, []).toPSBT());
    setRpcSignPsbtParams({
      allowedSighash: [btc.SigHash.NONE],
      broadcast: false,
      descriptor: singleSigDescriptor,
      psbtHex,
    });
    mocks.useDescriptorPsbtDetails.mockReturnValue({ hasDisallowedSighash: true });

    const { hasDisallowedSighash } = useRpcSignPsbt();

    expect(hasDisallowedSighash).toBe(true);
  });

  test('rejects signing when the psbt cannot be parsed for the sighash check', () => {
    setRpcSignPsbtParams({ broadcast: false, psbtHex: '0001' });

    const { hasDisallowedSighash } = useRpcSignPsbt();

    expect(hasDisallowedSighash).toBe(true);
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
      }),
      { frameId }
    );
    expect(mocks.closeWindow).toHaveBeenCalled();
  });

  function makeMatchedBondRoute() {
    return {
      status: 'matched' as const,
      policy: {
        id: 'policy-1',
        parentAccountId: 'f1f1f1f1/0',
        networkId: 'mainnet',
        address: 'bcrt1qwdyntrgqktm5h3a7l4aryndha8p09yuuc377cj9xs869gkg43lqq5x3h76',
        role: 'signer' as const,
        chain: 'bitcoin' as const,
        descriptor: multiSigDescriptor,
      },
      bondDescriptor: multiSigDescriptor,
      unlockHeight: 1000,
    };
  }

  test('converts the request into a proposal when a bond route matches, ignoring broadcast', async () => {
    const psbtHex = bytesToHex(buildPolicyTx(multiSigDescriptor, []).toPSBT());
    const bondRoute = makeMatchedBondRoute();
    setRpcSignPsbtParams({ broadcast: true, descriptor: 'bond', psbtHex });
    mocks.useBondProposalRoute.mockReturnValue(bondRoute);
    mocks.proposeMultisigTransaction.mockResolvedValue({ id: 'proposal-1' });

    await useRpcSignPsbt().onSignPsbt({ inputs: [] });

    expect(mocks.proposeMultisigTransaction).toHaveBeenCalledWith({
      network: 'btc:mainnet',
      multisigAddress: bondRoute.policy.address,
      rawPayload: psbtHexToBase64(psbtHex),
    });
    expect(mocks.track).toHaveBeenCalledWith('propose_multisig_transaction', { symbol: 'btc' });
    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcSuccessResponse('signPsbt', {
        id: requestId,
        result: { hex: psbtHex, proposalId: 'proposal-1', status: 'proposed' },
      }),
      { frameId }
    );
    expect(mocks.signDescriptorPsbt).not.toHaveBeenCalled();
    expect(mocks.signPsbt).not.toHaveBeenCalled();
    expect(mocks.broadcastTx).not.toHaveBeenCalled();
    expect(mocks.closeWindow).toHaveBeenCalled();
  });

  test('closes the window without reporting a failure when the proposal response cannot be delivered', async () => {
    const psbtHex = bytesToHex(buildPolicyTx(multiSigDescriptor, []).toPSBT());
    setRpcSignPsbtParams({ broadcast: false, descriptor: 'bond', psbtHex });
    mocks.useBondProposalRoute.mockReturnValue(makeMatchedBondRoute());
    mocks.proposeMultisigTransaction.mockResolvedValue({ id: 'proposal-1' });
    mocks.sendMessage.mockRejectedValue(new Error('Could not establish connection'));

    await useRpcSignPsbt().onSignPsbt({ inputs: [] });

    expect(mocks.closeWindow).toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  test('rejects the request and navigates to an error when proposing the bond transaction fails', async () => {
    const psbtHex = bytesToHex(buildPolicyTx(multiSigDescriptor, []).toPSBT());
    setRpcSignPsbtParams({ broadcast: false, descriptor: 'bond', psbtHex });
    mocks.useBondProposalRoute.mockReturnValue(makeMatchedBondRoute());
    mocks.proposeMultisigTransaction.mockRejectedValue(new Error('coordinator rejected'));

    await useRpcSignPsbt().onSignPsbt({ inputs: [] });

    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcErrorResponse('signPsbt', {
        id: requestId,
        error: {
          code: RpcErrorCode.INTERNAL_ERROR,
          message: 'Failed to propose transaction',
        },
      }),
      { frameId }
    );
    expect(mocks.navigate).toHaveBeenCalledWith(RouteUrls.RequestError, {
      state: { message: 'coordinator rejected', title: 'Unable to propose transaction' },
    });
    expect(mocks.closeWindow).not.toHaveBeenCalled();
  });

  test('falls back to a generic error message when the propose rejection is not an Error', async () => {
    const psbtHex = bytesToHex(buildPolicyTx(multiSigDescriptor, []).toPSBT());
    setRpcSignPsbtParams({ broadcast: false, descriptor: 'bond', psbtHex });
    mocks.useBondProposalRoute.mockReturnValue(makeMatchedBondRoute());
    mocks.proposeMultisigTransaction.mockRejectedValue('coordinator rejected');

    await useRpcSignPsbt().onSignPsbt({ inputs: [] });

    expect(mocks.navigate).toHaveBeenCalledWith(RouteUrls.RequestError, {
      state: { message: 'Failed to propose transaction', title: 'Unable to propose transaction' },
    });
  });

  test('rejects the request and blocks signing when the bond route errors', async () => {
    const psbtHex = bytesToHex(buildPolicyTx(multiSigDescriptor, []).toPSBT());
    setRpcSignPsbtParams({ broadcast: false, descriptor: 'bond', psbtHex });
    mocks.useBondProposalRoute.mockReturnValue({
      status: 'error',
      code: RpcErrorCode.INVALID_PARAMS,
      message: 'Descriptor is not a supported bond template',
    });

    const { onSignPsbt } = useRpcSignPsbt();

    expect(mocks.sendMessage).toHaveBeenCalledWith(
      tabId,
      createRpcErrorResponse('signPsbt', {
        id: requestId,
        error: {
          code: RpcErrorCode.INVALID_PARAMS,
          message: 'Descriptor is not a supported bond template',
        },
      }),
      { frameId }
    );
    expect(mocks.navigate).toHaveBeenCalledWith(RouteUrls.RequestError, {
      state: {
        message: 'Descriptor is not a supported bond template',
        title: 'Unable to propose transaction',
      },
    });

    await onSignPsbt({ inputs: [] });

    expect(mocks.signDescriptorPsbt).not.toHaveBeenCalled();
    expect(mocks.signPsbt).not.toHaveBeenCalled();
    expect(mocks.proposeMultisigTransaction).not.toHaveBeenCalled();
  });
});
