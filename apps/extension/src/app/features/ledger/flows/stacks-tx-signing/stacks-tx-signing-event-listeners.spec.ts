import { makeUnsignedSTXTokenTransfer } from '@stacks/transactions';

import { appEvents } from '@app/common/publish-subscribe';

import { listenForStacksTxLedgerSigning } from './stacks-tx-signing-event-listeners';

const unsignedTx = 'aa';

function createSignedTx() {
  return makeUnsignedSTXTokenTransfer({
    recipient: 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB',
    amount: 500,
    fee: 100,
    nonce: 0,
    network: 'mainnet',
    publicKey: '02b6b0afe5f620bc8e532b640b148dd9dea0ed19d11f8ab420fcce488fe3974893',
  });
}

describe(listenForStacksTxLedgerSigning.name, () => {
  test('resolves with the signed tx when the matching tx is signed', async () => {
    const promise = listenForStacksTxLedgerSigning(unsignedTx);
    const signedTx = await createSignedTx();

    appEvents.publish('ledgerStacksTxSigned', { unsignedTx, signedTx });

    await expect(promise).resolves.toBe(signedTx);
  });

  test('ignores signing and cancellation events for other txs', async () => {
    const promise = listenForStacksTxLedgerSigning(unsignedTx);
    const otherSignedTx = await createSignedTx();
    const expectedSignedTx = await createSignedTx();

    appEvents.publish('ledgerStacksTxSigned', { unsignedTx: 'bb', signedTx: otherSignedTx });
    appEvents.publish('ledgerStacksTxSigningCancelled', {
      unsignedTx: 'bb',
      error: 'other request cancelled',
    });
    appEvents.publish('ledgerStacksTxSigned', { unsignedTx, signedTx: expectedSignedTx });

    await expect(promise).resolves.toBe(expectedSignedTx);
  });

  test('rejects with the propagated device error when signing is cancelled', async () => {
    const promise = listenForStacksTxLedgerSigning(unsignedTx);

    appEvents.publish('ledgerStacksTxSigningCancelled', {
      unsignedTx,
      error: 'Data is invalid : bad tx',
    });

    await expect(promise).rejects.toThrow('Data is invalid : bad tx');
  });

  test('rejects with a default message when cancelled without an error', async () => {
    const promise = listenForStacksTxLedgerSigning(unsignedTx);

    appEvents.publish('ledgerStacksTxSigningCancelled', { unsignedTx });

    await expect(promise).rejects.toThrow('User cancelled the signing operation');
  });
});
