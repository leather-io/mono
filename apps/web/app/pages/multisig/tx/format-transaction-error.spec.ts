import { describe, expect, it } from 'vitest';

import { LeatherApiError } from '@leather.io/services';

import { formatTransactionActionError } from './format-transaction-error';

const broadcastUrl = 'https://staging.api.leather.io/v1/multisig/transactions/abc/broadcast';

describe('formatTransactionActionError', () => {
  it('extracts the rejection reason from a LeatherApiError response body', () => {
    const error = new LeatherApiError(broadcastUrl, 502, 'Bad Gateway', {
      error:
        'Broadcast failed: Stacks node sendtx failed: {"error":"transaction rejected","reason":"FeeTooLow","reason_data":{"actual":1,"expected":252},"txid":"e6bdf24f"}',
    });
    expect(formatTransactionActionError(error)).toBe('Transaction rejected: FeeTooLow');
  });

  it('falls back to the response body when it has no embedded reason', () => {
    const error = new LeatherApiError(broadcastUrl, 400, 'Bad Request', {
      error: 'Broadcast failed: something else',
    });
    expect(formatTransactionActionError(error)).toBe('Broadcast failed: something else');
  });

  it('extracts the reason from a plain error message', () => {
    const error = new Error(
      'Stacks node sendtx failed: {"reason":"NotEnoughFunds","txid":"deadbeef"}'
    );
    expect(formatTransactionActionError(error)).toBe('Transaction rejected: NotEnoughFunds');
  });

  it('returns the original message when there is no embedded reason', () => {
    expect(formatTransactionActionError(new Error('Something went wrong'))).toBe(
      'Something went wrong'
    );
  });

  it('returns the original message when embedded json is malformed', () => {
    expect(formatTransactionActionError(new Error('Broadcast failed: {not valid json'))).toBe(
      'Broadcast failed: {not valid json'
    );
  });

  it('returns undefined for an empty message', () => {
    expect(formatTransactionActionError(new Error('   '))).toBeUndefined();
  });
});
