import {
  deviceMatchesLegacyLedgerWallet,
  resolveLedgerStacksDerivationPathType,
} from './request-stacks-keys.utils';

const fingerprint = 'e87a850b';

const stacksStandardDescriptors = [
  `[${fingerprint}/44'/5757'/0'/0/0]025b2c58`,
  `[${fingerprint}/44'/5757'/0'/0/1]03a1b2c3`,
];

const ledgerLiveDescriptors = [
  `[${fingerprint}/44'/5757'/0'/0/0]025b2c58`,
  `[${fingerprint}/44'/5757'/1'/0/0]03a1b2c3`,
];

const legacyDescriptors = [
  `[00000000/44'/5757'/0'/0/0]025b2c58`,
  `[00000000/44'/5757'/0'/0/1]03a1b2c3`,
];

describe(resolveLedgerStacksDerivationPathType.name, () => {
  test('that it honors the chosen type for a fresh device', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: [],
        fingerprint,
        hasWalletForFingerprint: false,
        legacyWalletMatchesDevice: false,
        chosenDerivationPathType: 'ledgerLive',
      })
    ).toEqual({ status: 'resolved', derivationPathType: 'ledgerLive', overriddenChosenType: null });
  });

  test('that it requires a choice for a fresh device without a valid choice', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: [],
        fingerprint,
        hasWalletForFingerprint: false,
        legacyWalletMatchesDevice: false,
        chosenDerivationPathType: undefined,
      })
    ).toEqual({ status: 'needs-choice' });

    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: [],
        fingerprint,
        hasWalletForFingerprint: false,
        legacyWalletMatchesDevice: false,
        chosenDerivationPathType: 'not-a-scheme',
      })
    ).toEqual({ status: 'needs-choice' });
  });

  test('that existing keys for the device override the chosen type', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: stacksStandardDescriptors,
        fingerprint,
        hasWalletForFingerprint: true,
        legacyWalletMatchesDevice: false,
        chosenDerivationPathType: 'ledgerLive',
      })
    ).toEqual({
      status: 'resolved',
      derivationPathType: 'stacks',
      overriddenChosenType: 'ledgerLive',
    });

    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: ledgerLiveDescriptors,
        fingerprint,
        hasWalletForFingerprint: true,
        legacyWalletMatchesDevice: false,
        chosenDerivationPathType: 'stacks',
      })
    ).toEqual({
      status: 'resolved',
      derivationPathType: 'ledgerLive',
      overriddenChosenType: 'stacks',
    });
  });

  test('that a chosen type matching the inferred type is not reported as overridden', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: ledgerLiveDescriptors,
        fingerprint,
        hasWalletForFingerprint: true,
        legacyWalletMatchesDevice: false,
        chosenDerivationPathType: 'ledgerLive',
      })
    ).toEqual({ status: 'resolved', derivationPathType: 'ledgerLive', overriddenChosenType: null });
  });

  test('that inference without a valid choice is not reported as overridden', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: ledgerLiveDescriptors,
        fingerprint,
        hasWalletForFingerprint: true,
        legacyWalletMatchesDevice: false,
        chosenDerivationPathType: undefined,
      })
    ).toEqual({ status: 'resolved', derivationPathType: 'ledgerLive', overriddenChosenType: null });
  });

  test('that keys of other wallets do not affect the choice', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: [`[a1b2c3d4/44'/5757'/0'/0/1]03d4e5f6`],
        fingerprint,
        hasWalletForFingerprint: false,
        legacyWalletMatchesDevice: false,
        chosenDerivationPathType: 'ledgerLive',
      })
    ).toEqual({ status: 'resolved', derivationPathType: 'ledgerLive', overriddenChosenType: null });
  });

  test('that a legacy wallet matching the device pins it to the stacks standard', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: legacyDescriptors,
        fingerprint,
        hasWalletForFingerprint: false,
        legacyWalletMatchesDevice: true,
        chosenDerivationPathType: 'ledgerLive',
      })
    ).toEqual({
      status: 'resolved',
      derivationPathType: 'stacks',
      overriddenChosenType: 'ledgerLive',
    });
  });

  test('that legacy keys are ignored once the device has its own wallet', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: [...legacyDescriptors, ...ledgerLiveDescriptors],
        fingerprint,
        hasWalletForFingerprint: true,
        legacyWalletMatchesDevice: true,
        chosenDerivationPathType: 'stacks',
      })
    ).toEqual({
      status: 'resolved',
      derivationPathType: 'ledgerLive',
      overriddenChosenType: 'stacks',
    });
  });
});

describe(deviceMatchesLegacyLedgerWallet.name, () => {
  function stubRequestPublicKey(publicKeyHex: string) {
    return () => Promise.resolve({ publicKey: Buffer.from(publicKeyHex, 'hex') });
  }

  function rejectingRequestPublicKey(): Promise<{ publicKey?: Buffer }> {
    return Promise.reject(new Error('Expected no key request for this case'));
  }

  test('that it matches when the device returns the legacy account zero key', async () => {
    await expect(
      deviceMatchesLegacyLedgerWallet(stubRequestPublicKey('025b2c58'), legacyDescriptors)
    ).resolves.toBe(true);
  });

  test('that it does not match when the device returns a different key', async () => {
    await expect(
      deviceMatchesLegacyLedgerWallet(stubRequestPublicKey('03d4e5f6'), legacyDescriptors)
    ).resolves.toBe(false);
  });

  test('that it conservatively matches without a legacy account zero descriptor', async () => {
    await expect(
      deviceMatchesLegacyLedgerWallet(rejectingRequestPublicKey, [
        `[00000000/44'/5757'/0'/0/1]03a1b2c3`,
        ...stacksStandardDescriptors,
      ])
    ).resolves.toBe(true);
  });

  test('that it conservatively matches when the device returns no key', async () => {
    await expect(
      deviceMatchesLegacyLedgerWallet(() => Promise.resolve({}), legacyDescriptors)
    ).resolves.toBe(true);
  });
});
