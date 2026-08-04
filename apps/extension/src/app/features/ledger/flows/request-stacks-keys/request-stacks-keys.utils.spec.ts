import { resolveLedgerStacksDerivationPathType } from './request-stacks-keys.utils';

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
        hasLegacyLedgerWallet: false,
        chosenDerivationPathType: 'ledgerLive',
      })
    ).toEqual('ledgerLive');
  });

  test('that it defaults to the stacks standard without a valid choice', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: [],
        fingerprint,
        hasWalletForFingerprint: false,
        hasLegacyLedgerWallet: false,
        chosenDerivationPathType: undefined,
      })
    ).toEqual('stacks');

    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: [],
        fingerprint,
        hasWalletForFingerprint: false,
        hasLegacyLedgerWallet: false,
        chosenDerivationPathType: 'not-a-scheme',
      })
    ).toEqual('stacks');
  });

  test('that existing keys for the device override the chosen type', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: stacksStandardDescriptors,
        fingerprint,
        hasWalletForFingerprint: true,
        hasLegacyLedgerWallet: false,
        chosenDerivationPathType: 'ledgerLive',
      })
    ).toEqual('stacks');

    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: ledgerLiveDescriptors,
        fingerprint,
        hasWalletForFingerprint: true,
        hasLegacyLedgerWallet: false,
        chosenDerivationPathType: 'stacks',
      })
    ).toEqual('ledgerLive');
  });

  test('that keys of other wallets do not affect the choice', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: [`[a1b2c3d4/44'/5757'/0'/0/1]03d4e5f6`],
        fingerprint,
        hasWalletForFingerprint: false,
        hasLegacyLedgerWallet: false,
        chosenDerivationPathType: 'ledgerLive',
      })
    ).toEqual('ledgerLive');
  });

  test('that an unmigrated legacy wallet pins an unknown device to the stacks standard', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: legacyDescriptors,
        fingerprint,
        hasWalletForFingerprint: false,
        hasLegacyLedgerWallet: true,
        chosenDerivationPathType: 'ledgerLive',
      })
    ).toEqual('stacks');
  });

  test('that legacy keys are ignored once the device has its own wallet', () => {
    expect(
      resolveLedgerStacksDerivationPathType({
        stxKeychainDescriptors: [...legacyDescriptors, ...ledgerLiveDescriptors],
        fingerprint,
        hasWalletForFingerprint: true,
        hasLegacyLedgerWallet: true,
        chosenDerivationPathType: 'stacks',
      })
    ).toEqual('ledgerLive');
  });
});
