import type { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';
import { describe, expect, it } from 'vitest';

import type { HiroPrincipalNoncesResponse } from '../hiro-api-types';
import { parseAccountNoncesResponse } from './account-nonces.utils';

const senderAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';

function createNonces(
  overrides: Partial<HiroPrincipalNoncesResponse> = {}
): HiroPrincipalNoncesResponse {
  return {
    next_nonce: 0,
    last_confirmed_nonce: null,
    mempool: { last_nonce: null, pending_nonces: [], missing_nonces: [] },
    ...overrides,
  };
}

function createConfirmedTx(nonce: number) {
  return { nonce, sender_address: senderAddress } as Transaction;
}

function createPendingTx(nonce: number) {
  return { nonce, sender_address: senderAddress } as MempoolTransaction;
}

describe('parseAccountNoncesResponse', () => {
  it('returns an undefined nonce when there is no nonces response', () => {
    expect(
      parseAccountNoncesResponse({
        addressNonces: undefined,
        confirmedTransactions: [],
        pendingTransactions: [],
        senderAddress,
      })
    ).toEqual({ nonce: undefined, nonceType: 'undefined-nonce' });
  });

  it('uses next_nonce when there are no missing or pending nonces', () => {
    expect(
      parseAccountNoncesResponse({
        addressNonces: createNonces({ next_nonce: 6, last_confirmed_nonce: 5 }),
        confirmedTransactions: [createConfirmedTx(5)],
        pendingTransactions: [],
        senderAddress,
      })
    ).toEqual({ nonce: 6, nonceType: 'api-suggested-nonce' });
  });

  it('uses the first mempool missing nonce when there are no pending transactions', () => {
    expect(
      parseAccountNoncesResponse({
        addressNonces: createNonces({
          next_nonce: 9,
          last_confirmed_nonce: 5,
          mempool: { last_nonce: 8, pending_nonces: [8], missing_nonces: [7, 6] },
        }),
        confirmedTransactions: [createConfirmedTx(5)],
        pendingTransactions: [],
        senderAddress,
      })
    ).toEqual({ nonce: 6, nonceType: 'api-suggested-nonce' });
  });

  it('falls back to the last confirmed nonce when next_nonce is zero despite confirmed transactions', () => {
    expect(
      parseAccountNoncesResponse({
        addressNonces: createNonces({ next_nonce: 0, last_confirmed_nonce: null }),
        confirmedTransactions: [createConfirmedTx(3)],
        pendingTransactions: [],
        senderAddress,
      })
    ).toEqual({ nonce: 4, nonceType: 'client-fallback-nonce' });
  });

  it('increments the last pending nonce when pending transactions include next_nonce', () => {
    expect(
      parseAccountNoncesResponse({
        addressNonces: createNonces({
          next_nonce: 6,
          last_confirmed_nonce: 5,
          mempool: { last_nonce: 6, pending_nonces: [], missing_nonces: [] },
        }),
        confirmedTransactions: [createConfirmedTx(5)],
        pendingTransactions: [createPendingTx(6)],
        senderAddress,
      })
    ).toEqual({ nonce: 7, nonceType: 'client-fallback-nonce' });
  });

  it('uses the numerically lowest mempool missing nonce', () => {
    expect(
      parseAccountNoncesResponse({
        addressNonces: createNonces({
          next_nonce: 11,
          last_confirmed_nonce: 8,
          mempool: { last_nonce: 11, pending_nonces: [11], missing_nonces: [10, 9] },
        }),
        confirmedTransactions: [createConfirmedTx(8)],
        pendingTransactions: [],
        senderAddress,
      })
    ).toEqual({ nonce: 9, nonceType: 'api-suggested-nonce' });
  });

  it('uses the numerically lowest missing nonce between pending transactions', () => {
    expect(
      parseAccountNoncesResponse({
        addressNonces: createNonces({
          next_nonce: 8,
          last_confirmed_nonce: 7,
          mempool: { last_nonce: 11, pending_nonces: [8, 11], missing_nonces: [] },
        }),
        confirmedTransactions: [createConfirmedTx(7)],
        pendingTransactions: [createPendingTx(8), createPendingTx(11)],
        senderAddress,
      })
    ).toEqual({ nonce: 9, nonceType: 'client-fallback-nonce' });
  });
});
