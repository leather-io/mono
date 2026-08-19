import { describe, expect, it } from 'vitest';

import type { BlockchainActivityView } from '@leather.io/features';

import { formatActivityActionLine, getActivityActionLine } from './activity-action-line';

function makeView(overrides: Partial<BlockchainActivityView>): BlockchainActivityView {
  return {
    key: 'stacks:tx1',
    txid: 'tx1',
    chain: 'stacks',
    timestamp: 1,
    action: 'send',
    status: 'success',
    avatar: { kind: 'icon', icon: 'contract-call' },
    indicator: 'function',
    title: '',
    subtitle: '',
    ...overrides,
  };
}

describe('getActivityActionLine', () => {
  it('composes the base-verb line "Stack via Fast Pool", not the past-tense subtitle', () => {
    const line = getActivityActionLine(makeView({ action: 'stack', protocolName: 'Fast Pool' }));
    expect(line).toBeDefined();
    expect(line && formatActivityActionLine(line)).toBe('Stack via Fast Pool');
    expect(line?.actionTitle).toBe('Stack');
    expect(line?.viaProtocol).toBe('via Fast Pool');
  });

  it('omits the via clause when the protocol has no name', () => {
    const line = getActivityActionLine(makeView({ action: 'stack' }));
    expect(line && formatActivityActionLine(line)).toBe('Stack');
    expect(line?.viaProtocol).toBeUndefined();
  });

  it('returns undefined for transfers, contract calls, and deploys', () => {
    expect(getActivityActionLine(makeView({ action: 'send' }))).toBeUndefined();
    expect(getActivityActionLine(makeView({ action: 'receive' }))).toBeUndefined();
    expect(getActivityActionLine(makeView({ action: 'contract-execution' }))).toBeUndefined();
    expect(getActivityActionLine(makeView({ action: 'contract-deploy' }))).toBeUndefined();
  });
});
