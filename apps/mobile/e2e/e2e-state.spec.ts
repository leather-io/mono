import { beforeEach, describe, expect, test } from 'vitest';

import {
  describeBroadcasts,
  publishScenarios,
  readE2eState,
  recordBroadcast,
  resetBroadcasts,
} from './e2e-state';

const stacksTxid = 'ab'.repeat(32);
const bitcoinTxid = 'cd'.repeat(32);

describe('accepted broadcasts', () => {
  beforeEach(() => {
    resetBroadcasts();
  });

  test('describes no broadcasts as 0', () => {
    expect(describeBroadcasts(readE2eState())).toBe('0');
  });

  test('counts every broadcast and names the latest one', () => {
    recordBroadcast('stacks', stacksTxid);
    expect(describeBroadcasts(readE2eState())).toBe(`1 stacks ${stacksTxid}`);
    recordBroadcast('bitcoin', bitcoinTxid);
    expect(describeBroadcasts(readE2eState())).toBe(`2 bitcoin ${bitcoinTxid}`);
  });

  test('keeps the record when scenarios are published and clears it on reset', () => {
    recordBroadcast('stacks', stacksTxid);
    publishScenarios('send-swap', false);
    expect(describeBroadcasts(readE2eState())).toBe(`1 stacks ${stacksTxid}`);
    resetBroadcasts();
    expect(describeBroadcasts(readE2eState())).toBe('0');
  });
});
