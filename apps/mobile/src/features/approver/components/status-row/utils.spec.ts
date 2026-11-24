import { describe, expect, it } from 'vitest';

import type { StacksTransaction } from '@leather.io/models';

import { getStxTxStatus } from './utils';

describe(getStxTxStatus.name, () => {
  it('treats a missing transaction as pending', () => {
    expect(getStxTxStatus(undefined)).toBe('pending');
  });

  it('maps a pending transaction to pending', () => {
    expect(getStxTxStatus('pending')).toBe('pending');
  });

  it('maps a successful transaction to success', () => {
    expect(getStxTxStatus('success')).toBe('success');
  });

  it.each<StacksTransaction['status']>([
    'abort_by_response',
    'abort_by_post_condition',
    'problematic_skipped',
    'dropped_replace_by_fee',
    'dropped_replace_across_fork',
    'dropped_too_expensive',
    'dropped_stale_garbage_collect',
    'dropped_problematic',
  ])('maps %s to failed', status => {
    expect(getStxTxStatus(status)).toBe('failed');
  });
});
