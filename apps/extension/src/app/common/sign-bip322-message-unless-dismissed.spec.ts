import { describe, expect, test, vi } from 'vitest';

import { createBitcoinAddress } from '@leather.io/bitcoin';

import {
  isLedgerSigningCancelledError,
  unwrapLedgerSigningOutcome,
} from '@app/features/ledger/flow/unwrap-ledger-signing-outcome';

import { signBip322MessageUnlessDismissed } from './sign-bip322-message-unless-dismissed';

vi.mock('@leather.io/bitcoin', async importOriginal => ({
  ...(await importOriginal<object>()),
  async signBip322MessageSimple({ signPsbt }: { signPsbt(psbt: unknown): Promise<unknown> }) {
    await signPsbt({});
    return { signature: 'signature' };
  },
}));

const args = {
  message: 'hello',
  address: createBitcoinAddress('bc1q-address'),
  network: 'mainnet',
} satisfies Omit<Parameters<typeof signBip322MessageUnlessDismissed>[0], 'signPsbt'>;

describe(signBip322MessageUnlessDismissed.name, () => {
  test('returns null when the signer is dismissed', async () => {
    const result = await signBip322MessageUnlessDismissed({
      ...args,
      signPsbt() {
        return Promise.resolve(null);
      },
    });
    expect(result).toBeNull();
  });

  test('rethrows a cancelled ledger signing so callers can identify it', async () => {
    const promise = signBip322MessageUnlessDismissed({
      ...args,
      async signPsbt() {
        return unwrapLedgerSigningOutcome({ status: 'cancelled' });
      },
    });
    await expect(promise).rejects.toSatisfy(isLedgerSigningCancelledError);
  });

  test('rethrows a failed ledger signing as a non-cancelled error', async () => {
    const promise = signBip322MessageUnlessDismissed({
      ...args,
      async signPsbt() {
        return unwrapLedgerSigningOutcome({ status: 'failed', error: 'Device disconnected' });
      },
    });
    await expect(promise).rejects.toThrow('Device disconnected');
    await expect(promise).rejects.not.toSatisfy(isLedgerSigningCancelledError);
  });
});
