import { HDKey } from '@scure/bip32';

import type { OperationContext } from '@leather.io/ledger';
import { makeFakeHardwareBitcoinSigner } from '@leather.io/ledger/test-utils';

import { useDisplayLedgerDescriptorAddress } from './use-display-ledger-descriptor-address';

const mocks = vi.hoisted(() => ({
  showAddress: vi.fn(),
  toDeviceBusyStep: vi.fn(),
}));

vi.mock('../flow/ledger-flow.context', () => ({
  useLedgerSteps: () => ({ toDeviceBusyStep: mocks.toDeviceBusyStep }),
}));

vi.mock('@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks', () => ({
  useCurrentNativeSegwitAccount: () => ({
    keychain: accountKeychain,
    xpub: accountKeychain.publicExtendedKey,
    keyOrigin: accountKeyOrigin,
  }),
}));

function makeNativeSegwitAccountKeychain(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'");
}

const masterFingerprintHex = 'deadbeef';
const accountKeyOrigin = `${masterFingerprintHex}/84'/0'/0'`;
const accountKeychain = makeNativeSegwitAccountKeychain(1);
const cosignerXpub = makeNativeSegwitAccountKeychain(2).publicExtendedKey;
const vaultDescriptor = `wsh(multi(2,${cosignerXpub}/1/7,${accountKeychain.publicExtendedKey}/1/7))`;
const deviceAddress = 'bc1qdeviceaddress';

function makeSigner() {
  return makeFakeHardwareBitcoinSigner({ showAddress: mocks.showAddress });
}

describe(useDisplayLedgerDescriptorAddress.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.showAddress.mockResolvedValue(deviceAddress);
  });

  test('shows the policy address at the descriptor key path index with the account origin', async () => {
    const displayAddress = useDisplayLedgerDescriptorAddress();

    const address = await displayAddress(makeSigner(), vaultDescriptor, {});

    expect(address).toBe(deviceAddress);
    expect(mocks.showAddress).toHaveBeenCalledOnce();
    expect(mocks.showAddress.mock.calls[0][0]).toEqual({
      kind: 'policy',
      policyDescriptor: `wsh(multi(2,${cosignerXpub}/1/7,[${accountKeyOrigin}]${accountKeychain.publicExtendedKey}/1/7))`,
      changeIndex: 1,
      addressIndex: 7,
    });
  });

  test('shows the register prompt when the device asks to approve the policy', async () => {
    const onInteraction = vi.fn();
    mocks.showAddress.mockImplementation((_args: unknown, ctx: OperationContext) => {
      ctx.onInteraction?.({ type: 'approve-policy' });
      ctx.onInteraction?.({ type: 'verify-address' });
      return Promise.resolve(deviceAddress);
    });
    const displayAddress = useDisplayLedgerDescriptorAddress();

    await displayAddress(makeSigner(), vaultDescriptor, { onInteraction });

    expect(mocks.toDeviceBusyStep).toHaveBeenCalledOnce();
    expect(mocks.toDeviceBusyStep).toHaveBeenCalledWith(
      'Approve the Leather wallet policy on your Ledger…'
    );
    expect(onInteraction.mock.calls).toEqual([
      [{ type: 'approve-policy' }],
      [{ type: 'verify-address' }],
    ]);
  });

  test('fails fast when a co-signer is a raw public key', async () => {
    const rawKey = makeNativeSegwitAccountKeychain(2).deriveChild(0).deriveChild(0).publicKey;
    if (!rawKey) throw new Error('Expected public key');
    const rawKeyDescriptor = `wsh(multi(2,${Buffer.from(rawKey).toString('hex')},${accountKeychain.publicExtendedKey}/0/0))`;
    const displayAddress = useDisplayLedgerDescriptorAddress();

    await expect(displayAddress(makeSigner(), rawKeyDescriptor, {})).rejects.toThrow(
      'another signer is a raw public key'
    );
    expect(mocks.showAddress).not.toHaveBeenCalled();
  });
});
