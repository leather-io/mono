import { describe, expect, test } from 'vitest';

import {
  type JourneyEvent,
  type JourneyKind,
  type JourneyRun,
  createJourneyRun,
  isJourneyRun,
  reduceJourneyRun,
} from './journey-state';

function createRun(signer: JourneyRun['signer'] = 'software') {
  return createJourneyRun({ id: 'run-a', journeyId: 'swap', signer, startedAt: 100 });
}

function context(run: JourneyRun) {
  return { runId: run.id, revision: run.revision, at: run.startedAt + run.revision + 1 };
}

function request(run: JourneyRun, kind: JourneyKind = 'transaction', requestId = 'request-a') {
  return reduceJourneyRun(run, { ...context(run), type: 'request', requestId, kind });
}

function respond(
  run: JourneyRun,
  type: 'approve' | 'device-approved' | 'reject' | 'confirm' | 'continue'
) {
  const requestId = run.requestId;
  if (!requestId) throw new Error('Expected an active request');
  return reduceJourneyRun(run, { ...context(run), type, requestId });
}

describe(reduceJourneyRun.name, () => {
  test('submits a software transaction before confirmation and then continues once', () => {
    const initial = createRun();
    const review = request(initial);
    const pending = respond(review, 'approve');
    expect(pending.stage).toBe('pending');
    expect(pending.completedSteps).toEqual([]);
    const confirmed = respond(pending, 'confirm');
    expect(confirmed.stage).toBe('confirmed');
    const continued = respond(confirmed, 'continue');
    expect(continued).toMatchObject({ stage: 'ready', stepIndex: 1, completedSteps: [0] });
    expect(continued.requestId).toBeUndefined();
    expect(continued.events.map(entry => entry.type)).toEqual([
      'request',
      'approve',
      'confirm',
      'continue',
    ]);
    expect(initial).toMatchObject({ stage: 'ready', revision: 0, events: [], completedSteps: [] });
  });

  test('does not move a Ledger transaction forward before device approval', () => {
    const review = request(createRun('ledger'));
    const device = respond(review, 'approve');
    expect(device.stage).toBe('device');
    expect(respond(device, 'confirm')).toBe(device);
    expect(respond(device, 'approve')).toBe(device);
    expect(respond(device, 'device-approved').stage).toBe('pending');
  });

  test.each<JourneyKind>(['message', 'proposal', 'sign'])(
    'returns a %s signature without broadcasting',
    kind => {
      const signed = respond(request(createRun(), kind), 'approve');
      expect(signed.stage).toBe('signed');
      expect(respond(signed, 'confirm')).toBe(signed);
      expect(signed.feePaid).toBe(false);
    }
  );

  test('connection establishes permission without creating a pending transaction', () => {
    const connected = respond(request(createRun(), 'connect'), 'approve');
    expect(connected).toMatchObject({ connected: true, stage: 'confirmed', feePaid: false });
    expect(respond(connected, 'continue').connected).toBe(true);
  });

  test('broadcasts an already-signed Ledger transaction without asking the device to sign again', () => {
    const submitted = respond(request(createRun('ledger'), 'broadcast'), 'approve');
    expect(submitted.stage).toBe('pending');
    expect(submitted.transactions).toHaveLength(1);
    expect(submitted.events.some(event => event.label === 'Waiting for Ledger approval')).toBe(
      false
    );
  });

  test('shares an already-known Ledger account without requesting a device signature', () => {
    const connected = respond(request(createRun('ledger'), 'connect'), 'approve');
    expect(connected).toMatchObject({ stage: 'confirmed', connected: true, transactions: [] });
  });

  test('broadcast waits for chain confirmation', () => {
    const submitted = respond(request(createRun(), 'broadcast'), 'approve');
    expect(submitted.stage).toBe('pending');
  });

  test.each<JourneyRun['signer']>(['software', 'ledger'])(
    'rejection with %s pays no fee and allows a fresh request',
    signer => {
      const review = request(createRun(signer));
      const approval = signer === 'ledger' ? respond(review, 'approve') : review;
      const rejected = respond(approval, 'reject');
      expect(rejected).toMatchObject({ stage: 'rejected', feePaid: false, completedSteps: [] });
      expect(request(rejected, 'transaction', 'retry').stage).toBe('review');
    }
  );

  test('a failed submitted call can retain its fee but cannot continue as success', () => {
    const pending = respond(request(createRun()), 'approve');
    const failed = reduceJourneyRun(pending, {
      ...context(pending),
      type: 'fail',
      requestId: 'request-a',
      feePaid: true,
    });
    expect(failed).toMatchObject({ stage: 'failed', feePaid: true, completedSteps: [] });
    expect(respond(failed, 'continue')).toBe(failed);
    expect(request(failed, 'transaction', 'retry')).toMatchObject({
      stage: 'review',
      feePaid: false,
    });
  });

  test('keeps failed fee receipts when a later attempt succeeds', () => {
    const initial = createRun();
    const configured = reduceJourneyRun(initial, {
      ...context(initial),
      type: 'configure',
      amount: { stepId: 'swap', value: '25' },
    });
    const pending = respond(request(configured), 'approve');
    const failed = reduceJourneyRun(pending, {
      ...context(pending),
      type: 'fail',
      requestId: 'request-a',
      feePaid: true,
    });
    const retry = request(failed, 'transaction', 'request-b');
    const succeeded = respond(respond(retry, 'approve'), 'confirm');
    expect(succeeded.transactions).toEqual([
      {
        requestId: 'request-a',
        stepIndex: 0,
        status: 'failed',
        feePaid: true,
        amounts: { swap: '25' },
      },
      {
        requestId: 'request-b',
        stepIndex: 0,
        status: 'confirmed',
        feePaid: true,
        amounts: { swap: '25' },
      },
    ]);
    expect(retry.feePaid).toBe(false);
    expect(retry.transactions[0]?.feePaid).toBe(true);
    expect(retry.transactions[0]?.amounts).not.toBe(configured.amounts);
  });

  test('retains no-fee failed receipts and does not reuse a transaction request id', () => {
    const pending = respond(request(createRun()), 'approve');
    const failed = reduceJourneyRun(pending, {
      ...context(pending),
      type: 'fail',
      requestId: 'request-a',
    });
    expect(failed.transactions[0]).toMatchObject({ status: 'failed', feePaid: false });
    expect(request(failed, 'transaction', 'request-a')).toBe(failed);
  });

  test.each<JourneyKind>(['connect', 'message', 'proposal', 'sign'])(
    'does not create a chain receipt for %s',
    kind => {
      expect(respond(request(createRun(), kind), 'approve').transactions).toEqual([]);
    }
  );

  test('does not duplicate pending receipts when callbacks are replayed', () => {
    const review = request(createRun('ledger'));
    const device = respond(review, 'approve');
    const pending = respond(device, 'device-approved');
    expect(pending.transactions).toHaveLength(1);
    expect(respond(pending, 'device-approved')).toBe(pending);
    expect(respond(pending, 'approve')).toBe(pending);
    expect(pending.transactions[0]).toMatchObject({ status: 'pending', feePaid: false });
  });

  test('ignores duplicated approval and callbacks from another run, revision or request', () => {
    const review = request(createRun());
    const approval: JourneyEvent = { ...context(review), type: 'approve', requestId: 'request-a' };
    const pending = reduceJourneyRun(review, approval);
    expect(reduceJourneyRun(pending, approval)).toBe(pending);
    expect(
      reduceJourneyRun(pending, {
        ...context(pending),
        type: 'confirm',
        requestId: 'stale-request',
      })
    ).toBe(pending);
    expect(
      reduceJourneyRun(pending, {
        ...context(pending),
        runId: 'old-run',
        type: 'confirm',
        requestId: 'request-a',
      })
    ).toBe(pending);
    expect(
      reduceJourneyRun(pending, {
        ...context(pending),
        revision: 0,
        type: 'confirm',
        requestId: 'request-a',
      })
    ).toBe(pending);
  });

  test('editing an amount or signer is shared state and is frozen while reviewing', () => {
    const initial = createRun();
    const configured = reduceJourneyRun(initial, {
      ...context(initial),
      type: 'configure',
      signer: 'ledger',
      amount: { stepId: 'swap', value: '25.5' },
    });
    expect(configured).toMatchObject({ signer: 'ledger', amounts: { swap: '25.5' } });
    const review = request(configured);
    expect(
      reduceJourneyRun(review, {
        ...context(review),
        type: 'configure',
        amount: { stepId: 'swap', value: '50' },
      })
    ).toBe(review);
    expect(configured.amounts.swap).toBe('25.5');
  });
});

describe(isJourneyRun.name, () => {
  test('accepts serialized ready and active runs', () => {
    const ready: unknown = JSON.parse(JSON.stringify(createRun()));
    const active: unknown = JSON.parse(
      JSON.stringify(respond(request(createRun('ledger')), 'approve'))
    );
    expect(isJourneyRun(ready)).toBe(true);
    expect(isJourneyRun(active)).toBe(true);
  });

  test('rejects invalid persisted state and incomplete request context', () => {
    const run = createRun();
    expect(isJourneyRun(null)).toBe(false);
    expect(isJourneyRun({ ...run, revision: -1 })).toBe(false);
    expect(isJourneyRun({ ...run, stage: 'pending' })).toBe(false);
    expect(isJourneyRun({ ...run, amounts: { swap: 12 } })).toBe(false);
    expect(
      isJourneyRun({
        ...run,
        transactions: [
          { requestId: 'r', stepIndex: 0, status: 'done', feePaid: true, amounts: {} },
        ],
      })
    ).toBe(false);
    expect(
      isJourneyRun({
        ...run,
        events: [{ id: 'bad', type: 'confirm', label: 'Confirmed', at: null }],
      })
    ).toBe(false);
  });
});
