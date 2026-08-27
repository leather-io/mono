import { ChainId } from '@stacks/network';
import {
  AddressHashMode,
  AddressVersion,
  deserializeTransaction,
  isSingleSig,
  makeUnsignedSTXTokenTransfer,
} from '@stacks/transactions';
import StacksApp, { LedgerError } from '@zondax/ledger-stacks';

import {
  MINIMUM_STACKS_APP_VERSION,
  MINIMUM_STACKS_APP_VERSION_MULTISIG_ADDRESS,
  isStxAddressResponseRejected,
  isStxAddressResponseSuccess,
  makeStxMultisigAddressOptions,
  showStxAddressOnDevice,
  showStxMultisigAddressOnDevice,
  signStacksTransactionWithSignature,
  stacksChainIdToMultiSigAddressVersion,
  stacksChainIdToSingleSigAddressVersion,
  validateStacksAppVersion,
} from './stacks-ledger-utils';

const recipient = 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB';
const signerPublicKey = '02b6b0afe5f620bc8e532b640b148dd9dea0ed19d11f8ab420fcce488fe3974893';
const secondPublicKey = '03c1e856462ca2844adb898aee90af5237e9d1be0fe51212635b2f7a643b0585e1';
const signatureHex = '00'.repeat(65);
const signatureVrs = Buffer.from(signatureHex, 'hex');

describe(signStacksTransactionWithSignature.name, () => {
  test('sets the signature on single-sig transactions', async () => {
    const unsignedTx = await makeUnsignedSTXTokenTransfer({
      recipient,
      amount: 500,
      fee: 100,
      nonce: 0,
      network: 'mainnet',
      publicKey: signerPublicKey,
    });

    const signedTx = signStacksTransactionWithSignature(unsignedTx.serialize(), signatureVrs);
    const spendingCondition = signedTx.auth.spendingCondition;

    if (!isSingleSig(spendingCondition)) throw new Error('Expected single-sig spending condition');

    expect(spendingCondition.signature.data).toEqual(signatureHex);
    expect(() => signedTx.serialize()).not.toThrow();
  });

  test('appends a signature auth field to multisig transactions', async () => {
    const unsignedTx = await makeUnsignedSTXTokenTransfer({
      recipient,
      amount: 500,
      fee: 100,
      nonce: 0,
      network: 'mainnet',
      publicKeys: [secondPublicKey, signerPublicKey],
      numSignatures: 2,
    });

    const signedTx = signStacksTransactionWithSignature(unsignedTx.serialize(), signatureVrs);
    const spendingCondition = signedTx.auth.spendingCondition;

    if (isSingleSig(spendingCondition)) throw new Error('Expected multisig spending condition');

    expect(spendingCondition.fields).toHaveLength(1);
    expect(() => signedTx.serialize()).not.toThrow();

    const serializedTx = signedTx.serialize();
    const deserializedTx = deserializeTransaction(serializedTx);
    const deserializedSpendingCondition = deserializedTx.auth.spendingCondition;

    if (isSingleSig(deserializedSpendingCondition))
      throw new Error('Expected deserialized multisig spending condition');

    expect(deserializedSpendingCondition.fields).toHaveLength(1);
  });
});

function makeAddressResponse(returnCode: number) {
  return {
    returnCode,
    errorMessage: '',
    publicKey: Buffer.alloc(33),
    address: 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB',
  };
}

describe(stacksChainIdToSingleSigAddressVersion.name, () => {
  test('maps the mainnet chain id to the mainnet single sig version', () => {
    expect(stacksChainIdToSingleSigAddressVersion(ChainId.Mainnet)).toBe(
      AddressVersion.MainnetSingleSig
    );
  });

  test('maps the testnet chain id to the testnet single sig version', () => {
    expect(stacksChainIdToSingleSigAddressVersion(ChainId.Testnet)).toBe(
      AddressVersion.TestnetSingleSig
    );
  });

  test('falls back to the testnet version for custom chain ids', () => {
    expect(stacksChainIdToSingleSigAddressVersion(256)).toBe(AddressVersion.TestnetSingleSig);
  });
});

describe(stacksChainIdToMultiSigAddressVersion.name, () => {
  test('maps the mainnet chain id to the mainnet multisig version', () => {
    expect(stacksChainIdToMultiSigAddressVersion(ChainId.Mainnet)).toBe(
      AddressVersion.MainnetMultiSig
    );
  });

  test('maps the testnet chain id to the testnet multisig version', () => {
    expect(stacksChainIdToMultiSigAddressVersion(ChainId.Testnet)).toBe(
      AddressVersion.TestnetMultiSig
    );
  });

  test('falls back to the testnet version for custom chain ids', () => {
    expect(stacksChainIdToMultiSigAddressVersion(256)).toBe(AddressVersion.TestnetMultiSig);
  });
});

const thirdPublicKey = '03c00170321c5ce931d3201927ff6b1993c350f72af5483b9d75e8505ef10aed8c';

describe(makeStxMultisigAddressOptions.name, () => {
  test('places the device key at its index and passes the other keys in order', () => {
    const result = makeStxMultisigAddressOptions({
      publicKeys: [secondPublicKey, signerPublicKey, thirdPublicKey],
      threshold: 2,
      devicePublicKey: signerPublicKey,
    });

    expect(result).toEqual({
      status: 'ok',
      options: {
        numRequired: 2,
        deviceKeyIndex: 1,
        cosignerPublicKeys: [secondPublicKey, thirdPublicKey],
        hashMode: AddressHashMode.P2SHNonSequential,
      },
    });
  });

  test('handles the device key being first or last', () => {
    const first = makeStxMultisigAddressOptions({
      publicKeys: [signerPublicKey, secondPublicKey],
      threshold: 1,
      devicePublicKey: signerPublicKey,
    });
    const last = makeStxMultisigAddressOptions({
      publicKeys: [secondPublicKey, thirdPublicKey, signerPublicKey],
      threshold: 3,
      devicePublicKey: signerPublicKey,
    });

    expect(first).toMatchObject({
      status: 'ok',
      options: { deviceKeyIndex: 0, cosignerPublicKeys: [secondPublicKey] },
    });
    expect(last).toMatchObject({
      status: 'ok',
      options: { deviceKeyIndex: 2, cosignerPublicKeys: [secondPublicKey, thirdPublicKey] },
    });
  });

  test('matches the device key case-insensitively and lowercases the cosigner keys', () => {
    const result = makeStxMultisigAddressOptions({
      publicKeys: [secondPublicKey.toUpperCase(), signerPublicKey],
      threshold: 2,
      devicePublicKey: signerPublicKey.toUpperCase(),
    });

    expect(result).toMatchObject({
      status: 'ok',
      options: { deviceKeyIndex: 1, cosignerPublicKeys: [secondPublicKey] },
    });
  });

  test('errors when the device key is not part of the multisig', () => {
    const result = makeStxMultisigAddressOptions({
      publicKeys: [secondPublicKey, thirdPublicKey],
      threshold: 2,
      devicePublicKey: signerPublicKey,
    });

    expect(result).toEqual({
      status: 'error',
      message: 'The active account is not a signer of this multisig.',
    });
  });

  test('errors when there are more keys than the device supports', () => {
    const result = makeStxMultisigAddressOptions({
      publicKeys: [signerPublicKey, ...Array.from({ length: 15 }, () => secondPublicKey)],
      threshold: 2,
      devicePublicKey: signerPublicKey,
    });

    expect(result).toEqual({
      status: 'error',
      message: 'Ledger can only verify multisig addresses with up to 15 keys.',
    });
  });
});

describe(isStxAddressResponseRejected.name, () => {
  test('detects an on-device rejection', () => {
    expect(isStxAddressResponseRejected(makeAddressResponse(LedgerError.TransactionRejected))).toBe(
      true
    );
  });

  test('does not flag a successful response', () => {
    expect(isStxAddressResponseRejected(makeAddressResponse(LedgerError.NoErrors))).toBe(false);
  });
});

describe(isStxAddressResponseSuccess.name, () => {
  test('accepts a successful response', () => {
    expect(isStxAddressResponseSuccess(makeAddressResponse(LedgerError.NoErrors))).toBe(true);
  });

  test('rejects any error return code', () => {
    expect(isStxAddressResponseSuccess(makeAddressResponse(LedgerError.TransactionRejected))).toBe(
      false
    );
  });
});

describe(showStxAddressOnDevice.name, () => {
  test('shows the account derivation path with the given address version', async () => {
    const app: StacksApp = Object.create(StacksApp.prototype);
    app.showAddressAndPubKey = vi.fn(() =>
      Promise.resolve(makeAddressResponse(LedgerError.NoErrors))
    );

    await showStxAddressOnDevice(app)("m/44'/5757'/0'/0/3", AddressVersion.MainnetSingleSig);

    expect(app.showAddressAndPubKey).toHaveBeenCalledWith(
      "m/44'/5757'/0'/0/3",
      AddressVersion.MainnetSingleSig
    );
  });

  test('shows a ledger live derivation path unchanged', async () => {
    const app: StacksApp = Object.create(StacksApp.prototype);
    app.showAddressAndPubKey = vi.fn(() =>
      Promise.resolve(makeAddressResponse(LedgerError.NoErrors))
    );

    await showStxAddressOnDevice(app)("m/44'/5757'/3'/0/0", AddressVersion.MainnetSingleSig);

    expect(app.showAddressAndPubKey).toHaveBeenCalledWith(
      "m/44'/5757'/3'/0/0",
      AddressVersion.MainnetSingleSig
    );
  });
});

describe(showStxMultisigAddressOnDevice.name, () => {
  test('shows the multisig address for the account derivation path and options', async () => {
    const app: StacksApp = Object.create(StacksApp.prototype);
    app.showMultisigAddressAndPubKey = vi.fn(() =>
      Promise.resolve(makeAddressResponse(LedgerError.NoErrors))
    );
    const options = {
      numRequired: 2,
      deviceKeyIndex: 0,
      cosignerPublicKeys: [secondPublicKey],
      hashMode: AddressHashMode.P2SHNonSequential,
    };

    await showStxMultisigAddressOnDevice(app)(
      "m/44'/5757'/0'/0/3",
      AddressVersion.MainnetMultiSig,
      options
    );

    expect(app.showMultisigAddressAndPubKey).toHaveBeenCalledWith(
      "m/44'/5757'/0'/0/3",
      AddressVersion.MainnetMultiSig,
      options
    );
  });
});

describe(validateStacksAppVersion.name, () => {
  test('rejects versions below the minimum', () => {
    expect(validateStacksAppVersion({ major: 0, minor: 26, patch: 16 })).toEqual({
      meetsMinimum: false,
      currentVersion: '0.26.16',
    });
    expect(validateStacksAppVersion({ major: 0, minor: 25, patch: 99 }).meetsMinimum).toBe(false);
  });

  test('accepts the exact minimum version', () => {
    expect(validateStacksAppVersion({ major: 0, minor: 26, patch: 17 })).toEqual({
      meetsMinimum: true,
      currentVersion: MINIMUM_STACKS_APP_VERSION,
    });
  });

  test('accepts versions above the minimum', () => {
    expect(validateStacksAppVersion({ major: 0, minor: 26, patch: 18 }).meetsMinimum).toBe(true);
    expect(validateStacksAppVersion({ major: 0, minor: 27, patch: 0 }).meetsMinimum).toBe(true);
    expect(validateStacksAppVersion({ major: 1, minor: 0, patch: 0 }).meetsMinimum).toBe(true);
  });

  test('checks against an explicit minimum version', () => {
    expect(
      validateStacksAppVersion(
        { major: 0, minor: 26, patch: 17 },
        MINIMUM_STACKS_APP_VERSION_MULTISIG_ADDRESS
      )
    ).toEqual({ meetsMinimum: false, currentVersion: '0.26.17' });
    expect(
      validateStacksAppVersion(
        { major: 0, minor: 27, patch: 0 },
        MINIMUM_STACKS_APP_VERSION_MULTISIG_ADDRESS
      ).meetsMinimum
    ).toBe(true);
  });
});
