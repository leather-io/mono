import { describe, expect, test, vi } from 'vitest';

import { getStxRequestParams } from './utils';

vi.mock('@/features/approver/utils', async () => {
  const { createMoneyFromDecimal } = await import('@leather.io/utils');
  return {
    getDefaultFee: () => createMoneyFromDecimal(0.003, 'STX'),
  };
});

vi.mock('@/store/apps/utils', () => ({ assertAppIsConnected: vi.fn() }));

vi.mock('@/store/keychains/stacks/stacks-keychains.read', () => ({
  stacksSignerFromAddress: vi.fn(),
}));

vi.mock('@/store/keychains/stacks/utils', () => ({ assertStacksSigner: vi.fn() }));

vi.mock('@/store/utils', () => ({ makeStacksAccountIdentiferFromDescriptor: vi.fn() }));

describe(getStxRequestParams.name, () => {
  test('treats the dApp-supplied fee as micro-stx denominated', () => {
    const result = getStxRequestParams({ fee: 1000 }, 5);

    expect(result.fee.amount.toString()).toEqual('1000');
    expect(result.fee.symbol).toEqual('STX');
  });

  test('rounds fractional micro-stx fees to whole units', () => {
    const result = getStxRequestParams({ fee: 1000.4 }, 5);

    expect(result.fee.amount.toString()).toEqual('1000');
  });

  test('falls back to the default fee when the request has no fee', () => {
    const result = getStxRequestParams({}, 5);

    expect(result.fee.amount.toString()).toEqual('3000');
  });

  test('uses the provided nonce when the request has none', () => {
    const result = getStxRequestParams({}, 7);

    expect(result.nonce).toEqual(7);
  });

  test('prefers the request nonce over the provided one', () => {
    const result = getStxRequestParams({ nonce: 3 }, 7);

    expect(result.nonce).toEqual(3);
  });
});
