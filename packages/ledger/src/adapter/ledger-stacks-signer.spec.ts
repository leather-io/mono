import { isSingleSig, makeUnsignedSTXTokenTransfer, uintCV } from '@stacks/transactions';
import { LedgerError } from '@zondax/ledger-stacks';

import { makeFakeLedgerStacksApp } from '../app/ledger-app.test-utils';
import { createLedgerStacksSigner } from './ledger-stacks-signer';

const fingerprintHex = '844b93a0';
const publicKey = '02b6b0afe5f620bc8e532b640b148dd9dea0ed19d11f8ab420fcce488fe3974893';
const key = { derivationPath: "m/44'/5757'/0'/0/0", publicKey };
const address = 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB';
const vrsHex = '01' + '02'.repeat(32) + '03'.repeat(32);
const rsvHex = '02'.repeat(32) + '03'.repeat(32) + '01';

function success<T extends object>(data: T) {
  return { returnCode: LedgerError.NoErrors, errorMessage: 'No errors', ...data };
}

function failure(returnCode: number, errorMessage: string) {
  return { returnCode, errorMessage };
}

async function makeTransaction() {
  return makeUnsignedSTXTokenTransfer({
    recipient: address,
    amount: 500,
    fee: 100,
    nonce: 0,
    network: 'mainnet',
    publicKey,
  });
}

describe(createLedgerStacksSigner.name, () => {
  test('requests account keys and returns descriptors keyed by the device fingerprint', async () => {
    const getAddressAndPubKey = vi
      .fn()
      .mockResolvedValue(success({ publicKey: Buffer.from(publicKey, 'hex'), address }));
    const app = makeFakeLedgerStacksApp({
      getMasterFingerprint: vi
        .fn()
        .mockResolvedValue(success({ fingerprint: Buffer.from(fingerprintHex, 'hex') })),
      getAddressAndPubKey,
    });
    const onRequestKey = vi.fn();

    const result = await createLedgerStacksSigner(app).requestAccountKeys(
      { derivationPathType: 'stacks', accountIndexes: [0, 3], onRequestKey },
      {}
    );

    expect(result.fingerprint).toBe(fingerprintHex);
    expect(result.keys).toEqual([
      {
        accountIndex: 0,
        path: "m/44'/5757'/0'/0/0",
        publicKey,
        descriptor: `[${fingerprintHex}/44'/5757'/0'/0/0]${publicKey}`,
      },
      {
        accountIndex: 3,
        path: "m/44'/5757'/0'/0/3",
        publicKey,
        descriptor: `[${fingerprintHex}/44'/5757'/0'/0/3]${publicKey}`,
      },
    ]);
    expect(onRequestKey.mock.calls).toEqual([[0], [3]]);
    expect(getAddressAndPubKey).toHaveBeenCalledTimes(2);
  });

  test('signs a transaction and applies the device signature', async () => {
    const sign = vi.fn().mockResolvedValue(success({ signatureVRS: Buffer.from(vrsHex, 'hex') }));
    const app = makeFakeLedgerStacksApp({ sign });
    const onInteraction = vi.fn();
    const transaction = await makeTransaction();

    const signed = await createLedgerStacksSigner(app).signTransaction(
      { transaction, key },
      { onInteraction }
    );

    expect(onInteraction).toHaveBeenCalledWith({ type: 'confirm-on-device' });
    expect(sign).toHaveBeenCalledWith(key.derivationPath, expect.any(Buffer));
    const spendingCondition = signed.auth.spendingCondition;
    if (!isSingleSig(spendingCondition)) throw new Error('Expected single-sig transaction');
    expect(spendingCondition.signature.data).toBe(vrsHex);
  });

  test.each([
    [LedgerError.TransactionRejected, 'rejected'],
    [LedgerError.DataIsInvalid, 'invalid-payload'],
  ])('maps a %s signing response to a %s error', async (returnCode, kind) => {
    const app = makeFakeLedgerStacksApp({
      sign: vi.fn().mockResolvedValue(failure(returnCode, 'App said no')),
    });
    const transaction = await makeTransaction();

    await expect(
      createLedgerStacksSigner(app).signTransaction({ transaction, key }, {})
    ).rejects.toMatchObject({ kind, message: 'App said no' });
  });

  test('signs a utf8 message and returns the rsv signature with the public key', async () => {
    const signMessage = vi
      .fn()
      .mockResolvedValue(success({ signatureVRS: Buffer.from(vrsHex, 'hex') }));
    const app = makeFakeLedgerStacksApp({ sign_msg: signMessage });

    const signature = await createLedgerStacksSigner(app).signMessage(
      { message: 'hello', key },
      {}
    );

    expect(signMessage).toHaveBeenCalledWith(key.derivationPath, 'hello');
    expect(signature).toEqual({ signature: rsvHex, publicKey });
  });

  test('signs a structured message with serialized domain and message', async () => {
    const signStructured = vi
      .fn()
      .mockResolvedValue(success({ signatureVRS: Buffer.from(vrsHex, 'hex') }));
    const app = makeFakeLedgerStacksApp({ sign_structured_msg: signStructured });

    const signature = await createLedgerStacksSigner(app).signStructuredMessage(
      { message: uintCV(2), domain: uintCV(1), key },
      {}
    );

    expect(signStructured).toHaveBeenCalledWith(
      key.derivationPath,
      '0100000000000000000000000000000001',
      '0100000000000000000000000000000002'
    );
    expect(signature.signature).toBe(rsvHex);
  });

  test('shows the address on the device and returns it', async () => {
    const showAddressAndPubKey = vi
      .fn()
      .mockResolvedValue(success({ publicKey: Buffer.from(publicKey, 'hex'), address }));
    const app = makeFakeLedgerStacksApp({ showAddressAndPubKey });
    const onInteraction = vi.fn();

    const shown = await createLedgerStacksSigner(app).showAddress(
      { derivationPath: key.derivationPath, chainId: 1 },
      { onInteraction }
    );

    expect(shown).toBe(address);
    expect(onInteraction).toHaveBeenCalledWith({ type: 'verify-address' });
    expect(showAddressAndPubKey).toHaveBeenCalledWith(key.derivationPath, 22);
  });

  test('rejects with a cancelled error when the signal is already aborted', async () => {
    const app = makeFakeLedgerStacksApp();
    const controller = new AbortController();
    controller.abort();

    await expect(
      createLedgerStacksSigner(app).showAddress(
        { derivationPath: key.derivationPath, chainId: 1 },
        { signal: controller.signal }
      )
    ).rejects.toMatchObject({ kind: 'cancelled' });
  });
});
