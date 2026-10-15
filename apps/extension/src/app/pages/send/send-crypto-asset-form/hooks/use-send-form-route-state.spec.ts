import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useSendFormRouteState } from './use-send-form-route-state';

const h = vi.hoisted((): { state: unknown } => ({ state: null }));

vi.mock('react-router', () => ({
  useLocation: () => ({ state: h.state }),
}));

describe(useSendFormRouteState.name, () => {
  beforeEach(() => {
    h.state = null;
  });

  test('restores every persisted send form value', () => {
    h.state = {
      symbol: 'STX',
      amount: '10',
      recipient: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      recipientBnsName: 'exchange.btc',
      memo: '123456',
      fee: '0.003',
      feeCurrency: 'STX',
      feeType: 'Middle',
      nonce: 4,
    };

    expect(useSendFormRouteState()).toEqual({
      amount: '10',
      recipient: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      recipientBnsName: 'exchange.btc',
      memo: '123456',
      fee: '0.003',
      feeCurrency: 'STX',
      feeType: 'Middle',
      nonce: 4,
    });
  });

  test('defaults amount and recipient and omits values that were not persisted', () => {
    expect(useSendFormRouteState()).toEqual({ amount: '', recipient: '' });
  });
});
