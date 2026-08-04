import { ChainId } from '@stacks/network';
import {
  AddressVersion,
  deserializeTransaction,
  isSingleSig,
  makeUnsignedSTXTokenTransfer,
} from '@stacks/transactions';
import StacksApp, { LedgerError } from '@zondax/ledger-stacks';

import {
  isStxAddressResponseRejected,
  isStxAddressResponseSuccess,
  showStxAddressOnDevice,
  signStacksTransactionWithSignature,
  stacksChainIdToSingleSigAddressVersion,
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
