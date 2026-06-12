import * as btc from '@scure/btc-signer';

import { appEvents } from '@app/common/publish-subscribe';

import { listenForBitcoinTxLedgerSigning } from './bitcoin-tx-signing-event-listeners';

describe(listenForBitcoinTxLedgerSigning.name, () => {
  test('resolves with the signed tx when the matching psbt is signed', async () => {
    const promise = listenForBitcoinTxLedgerSigning('aa');
    const signedPsbt = new btc.Transaction();

    appEvents.publish('ledgerBitcoinTxSigned', { unsignedPsbt: 'aa', signedPsbt });

    await expect(promise).resolves.toBe(signedPsbt);
  });

  test('ignores signing and cancellation events for other psbts', async () => {
    const promise = listenForBitcoinTxLedgerSigning('aa');
    const otherSignedPsbt = new btc.Transaction();
    const expectedSignedPsbt = new btc.Transaction();

    appEvents.publish('ledgerBitcoinTxSigned', {
      unsignedPsbt: 'bb',
      signedPsbt: otherSignedPsbt,
    });
    appEvents.publish('ledgerBitcoinTxSigningCancelled', {
      unsignedPsbt: 'bb',
      error: 'other request cancelled',
    });
    appEvents.publish('ledgerBitcoinTxSigned', {
      unsignedPsbt: 'aa',
      signedPsbt: expectedSignedPsbt,
    });

    await expect(promise).resolves.toBe(expectedSignedPsbt);
  });

  test('rejects with the propagated device error when signing is cancelled', async () => {
    const promise = listenForBitcoinTxLedgerSigning('aa');

    appEvents.publish('ledgerBitcoinTxSigningCancelled', {
      unsignedPsbt: 'aa',
      error: 'Ledger device locked',
    });

    await expect(promise).rejects.toThrow('Ledger device locked');
  });

  test('rejects with a default message when cancelled without an error', async () => {
    const promise = listenForBitcoinTxLedgerSigning('aa');

    appEvents.publish('ledgerBitcoinTxSigningCancelled', { unsignedPsbt: 'aa' });

    await expect(promise).rejects.toThrow('User cancelled the signing operation');
  });
});
