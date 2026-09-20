import {
  DefaultDescriptorTemplate,
  DefaultWallet,
  RegisteredWallet,
  type SignerBtc,
} from '@ledgerhq/device-signer-kit-bitcoin';

import {
  getExtendedPublicKey,
  getMasterFingerprintHex,
  getWalletAddressOnDevice,
  registerWalletPolicy,
  signPsbtWithWallet,
} from './bitcoin-signer-kit-utils';
import { fakeSignerAction, makeFakeLedgerBitcoinApp } from './ledger-app.mocks';

describe(getMasterFingerprintHex.name, () => {
  test('returns the fingerprint bytes as hex without opening the app', async () => {
    const getMasterFingerprint = vi.fn<SignerBtc['getMasterFingerprint']>(() =>
      fakeSignerAction({ masterFingerprint: Uint8Array.from([0xde, 0xad, 0xbe, 0xef]) })
    );
    const app = makeFakeLedgerBitcoinApp({ getMasterFingerprint });

    await expect(getMasterFingerprintHex(app)).resolves.toBe('deadbeef');
    expect(getMasterFingerprint).toHaveBeenCalledWith({ skipOpenApp: true });
  });
});

describe(getExtendedPublicKey.name, () => {
  test('strips the master key prefix before asking the signer kit for the key', async () => {
    const getExtendedPublicKeyAction = vi.fn<SignerBtc['getExtendedPublicKey']>(() =>
      fakeSignerAction({ extendedPublicKey: 'xpub6Fake' })
    );
    const app = makeFakeLedgerBitcoinApp({ getExtendedPublicKey: getExtendedPublicKeyAction });

    await expect(getExtendedPublicKey(app, "m/84'/0'/0'")).resolves.toBe('xpub6Fake');
    expect(getExtendedPublicKeyAction).toHaveBeenCalledWith("84'/0'/0'", {
      skipOpenApp: true,
    });
  });

  test('forwards a path that already lacks the master key prefix unchanged', async () => {
    const getExtendedPublicKeyAction = vi.fn<SignerBtc['getExtendedPublicKey']>(() =>
      fakeSignerAction({ extendedPublicKey: 'xpub6Fake' })
    );
    const app = makeFakeLedgerBitcoinApp({ getExtendedPublicKey: getExtendedPublicKeyAction });

    await getExtendedPublicKey(app, "86'/1'/2'");

    expect(getExtendedPublicKeyAction).toHaveBeenCalledWith("86'/1'/2'", { skipOpenApp: true });
  });
});

describe(registerWalletPolicy.name, () => {
  test('registers the policy without opening the app and returns the registered wallet', async () => {
    const registered = new RegisteredWallet(
      'Leather',
      'wsh(multi(2,@0/**,@1/**))',
      [],
      new Uint8Array(32)
    );
    const registerWallet = vi.fn<SignerBtc['registerWallet']>(() => fakeSignerAction(registered));
    const app = makeFakeLedgerBitcoinApp({ registerWallet });
    const policy = { name: 'Leather', descriptorTemplate: 'wsh(multi(2,@0/**,@1/**))', keys: [] };

    await expect(registerWalletPolicy(app, policy)).resolves.toBe(registered);
    expect(registerWallet).toHaveBeenCalledWith(policy, { skipOpenApp: true });
  });
});

describe(signPsbtWithWallet.name, () => {
  test('passes the wallet and base64 psbt through and keeps only partial signatures', async () => {
    const partialSignature = {
      inputIndex: 0,
      pubkey: Uint8Array.from([2]),
      signature: Uint8Array.from([0x30]),
    };
    const musigNonce = {
      inputIndex: 0,
      participantPubkey: Uint8Array.from([2]),
      aggregatedPubkey: Uint8Array.from([3]),
      tapleafHash: Uint8Array.from([4]),
      pubnonce: Uint8Array.from([5]),
    };
    const signPsbt = vi.fn<SignerBtc['signPsbt']>(() =>
      fakeSignerAction([musigNonce, partialSignature])
    );
    const app = makeFakeLedgerBitcoinApp({ signPsbt });
    const wallet = new RegisteredWallet(
      'Leather',
      'wsh(multi(2,@0/**,@1/**))',
      [],
      new Uint8Array(32)
    );

    const signatures = await signPsbtWithWallet(app, wallet, 'cHNidP8=');

    expect(signatures).toEqual([partialSignature]);
    expect(signPsbt).toHaveBeenCalledWith(wallet, 'cHNidP8=', { skipOpenApp: true });
  });
});

describe(getWalletAddressOnDevice.name, () => {
  test('asks the device to display the address at the given change and address index', async () => {
    const getWalletAddress = vi.fn<SignerBtc['getWalletAddress']>(() =>
      fakeSignerAction({ address: 'bc1qaddress' })
    );
    const app = makeFakeLedgerBitcoinApp({ getWalletAddress });
    const wallet = new DefaultWallet("84'/0'/0'", DefaultDescriptorTemplate.NATIVE_SEGWIT);

    const address = await getWalletAddressOnDevice(app, wallet, {
      changeIndex: 1,
      addressIndex: 7,
    });

    expect(address).toBe('bc1qaddress');
    expect(getWalletAddress).toHaveBeenCalledWith(wallet, 7, {
      checkOnDevice: true,
      change: true,
      skipOpenApp: true,
    });
  });

  test('requests the external chain for change index zero', async () => {
    const getWalletAddress = vi.fn<SignerBtc['getWalletAddress']>(() =>
      fakeSignerAction({ address: 'bc1qaddress' })
    );
    const app = makeFakeLedgerBitcoinApp({ getWalletAddress });
    const wallet = new DefaultWallet("86'/0'/0'", DefaultDescriptorTemplate.TAPROOT);

    await getWalletAddressOnDevice(app, wallet, { changeIndex: 0, addressIndex: 0 });

    expect(getWalletAddress).toHaveBeenCalledWith(
      wallet,
      0,
      expect.objectContaining({ change: false })
    );
  });
});
