import { DeviceActionStatus, UserInteractionRequired } from '@ledgerhq/device-management-kit';
import { RegisteredWallet, WalletPolicy } from '@ledgerhq/device-signer-kit-bitcoin';
import { hexToBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import { of } from 'rxjs';

import { fakeSignerAction, makeFakeLedgerBitcoinApp } from '../utils/ledger-app.mocks';
import { useDisplayLedgerDescriptorAddress } from './use-display-ledger-descriptor-address';

const mocks = vi.hoisted(() => ({
  registerWallet: vi.fn(),
  getWalletAddress: vi.fn(),
  toDeviceBusyStep: vi.fn(),
}));

vi.mock('./use-ledger-navigate', () => ({
  useLedgerNavigate: () => ({ toDeviceBusyStep: mocks.toDeviceBusyStep }),
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
const registeredPolicyHmac = new Uint8Array(32).fill(9);

function makeFakeLedgerApp() {
  return makeFakeLedgerBitcoinApp({
    getMasterFingerprint: () =>
      fakeSignerAction({ masterFingerprint: hexToBytes(masterFingerprintHex) }),
    registerWallet: mocks.registerWallet,
    getWalletAddress: mocks.getWalletAddress,
  });
}

describe(useDisplayLedgerDescriptorAddress.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.registerWallet.mockImplementation((policy: WalletPolicy) =>
      fakeSignerAction(
        new RegisteredWallet(
          policy.name,
          policy.descriptorTemplate,
          policy.keys,
          registeredPolicyHmac
        )
      )
    );
    mocks.getWalletAddress.mockImplementation(() => fakeSignerAction({ address: deviceAddress }));
  });

  test('registers the policy and displays the address at the descriptor key path index', async () => {
    const displayAddress = useDisplayLedgerDescriptorAddress();

    const address = await displayAddress(makeFakeLedgerApp(), vaultDescriptor);

    expect(address).toBe(deviceAddress);
    const [policy] = mocks.registerWallet.mock.calls[0];
    expect(policy).toBeInstanceOf(WalletPolicy);
    expect(policy).toMatchObject({
      name: 'Leather',
      descriptorTemplate: 'wsh(multi(2,@0/**,@1/**))',
      keys: [cosignerXpub, `[${accountKeyOrigin}]${accountKeychain.publicExtendedKey}`],
    });
    const [wallet, addressIndex, options] = mocks.getWalletAddress.mock.calls[0];
    expect(wallet).toBeInstanceOf(RegisteredWallet);
    expect(wallet).toMatchObject({ hmac: registeredPolicyHmac });
    expect(addressIndex).toBe(7);
    expect(options).toEqual({ checkOnDevice: true, change: true, skipOpenApp: true });
  });

  test('shows the register prompt and restores the caller screen once registered', async () => {
    const onWalletRegistered = vi.fn();
    mocks.registerWallet.mockImplementation((policy: WalletPolicy) => ({
      observable: of(
        {
          status: DeviceActionStatus.Pending,
          intermediateValue: { requiredUserInteraction: UserInteractionRequired.RegisterWallet },
        },
        {
          status: DeviceActionStatus.Completed,
          output: new RegisteredWallet(
            policy.name,
            policy.descriptorTemplate,
            policy.keys,
            registeredPolicyHmac
          ),
        }
      ),
      cancel: vi.fn(),
    }));
    const displayAddress = useDisplayLedgerDescriptorAddress();

    await displayAddress(makeFakeLedgerApp(), vaultDescriptor, { onWalletRegistered });

    expect(mocks.toDeviceBusyStep).toHaveBeenCalledWith(
      'Approve the Leather wallet policy on your Ledger…'
    );
    expect(onWalletRegistered).toHaveBeenCalledOnce();
    expect(mocks.getWalletAddress).toHaveBeenCalledOnce();
  });

  test('fails fast when a co-signer is a raw public key', async () => {
    const rawKey = makeNativeSegwitAccountKeychain(2).deriveChild(0).deriveChild(0).publicKey;
    if (!rawKey) throw new Error('Expected public key');
    const rawKeyDescriptor = `wsh(multi(2,${Buffer.from(rawKey).toString('hex')},${accountKeychain.publicExtendedKey}/0/0))`;
    const displayAddress = useDisplayLedgerDescriptorAddress();

    await expect(displayAddress(makeFakeLedgerApp(), rawKeyDescriptor)).rejects.toThrow(
      'another signer is a raw public key'
    );
    expect(mocks.registerWallet).not.toHaveBeenCalled();
  });
});
