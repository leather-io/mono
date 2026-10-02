// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import * as btc from '@scure/btc-signer';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  LedgerFlowProvider,
  useLedgerFlow,
  useLedgerFlowState,
  useLedgerSteps,
} from './ledger-flow.context';
import type {
  LedgerNonSigningFlowRequest,
  LedgerSigningOutcome,
  LedgerSigningRequest,
} from './ledger-flow.types';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const h = vi.hoisted(() => ({
  consumeHandoff: vi.fn(),
  isPopupMode: true,
  search: '',
}));

vi.mock('react-router', () => ({
  useSearchParams: () => [new URLSearchParams(h.search)],
}));

vi.mock('@app/common/utils', () => ({ isPopupMode: () => h.isPopupMode }));

vi.mock('./ledger-flow-handoff', () => ({
  consumeLedgerFlowHandoff: h.consumeHandoff,
  ledgerFlowHandoffParam: 'ledgerHandoff',
}));

interface RenderedFlow {
  flow: ReturnType<typeof useLedgerFlow>;
  state: ReturnType<typeof useLedgerFlowState>;
  steps: ReturnType<typeof useLedgerSteps>;
}

interface SignedRequest<T> {
  settled: ReturnType<typeof vi.fn<(outcome: LedgerSigningOutcome<T>) => void>>;
}

function renderFlow() {
  let value: RenderedFlow | undefined;
  function TestComponent() {
    value = { flow: useLedgerFlow(), state: useLedgerFlowState(), steps: useLedgerSteps() };
    return null;
  }
  const root = createRoot(document.createElement('div'));
  act(() => {
    root.render(createElement(LedgerFlowProvider, null, createElement(TestComponent)));
  });
  return {
    get value(): RenderedFlow {
      if (!value) throw new Error('Flow did not render');
      return value;
    },
    unmount() {
      act(() => root.unmount());
    },
  };
}

const signBitcoinTxRequest: LedgerSigningRequest<'sign-bitcoin-tx'> = {
  kind: 'sign-bitcoin-tx',
  psbt: new Uint8Array([1, 2, 3]),
  inputsToSign: [],
  settleOnRejection: false,
};

const signStacksTxRequest: LedgerSigningRequest<'sign-stacks-tx'> = {
  kind: 'sign-stacks-tx',
  tx: 'deadbeef',
  settleOnRejection: false,
};

const signStacksMessageRequest: LedgerSigningRequest<'sign-stacks-message'> = {
  kind: 'sign-stacks-message',
  message: { messageType: 'utf8', message: 'hello' },
};

const requestKeysRequest: LedgerNonSigningFlowRequest = {
  kind: 'request-keys',
  chain: 'bitcoin',
  autoConnect: false,
};

function startSigning<T>(start: () => Promise<LedgerSigningOutcome<T>>): SignedRequest<T> {
  const settled = vi.fn<(outcome: LedgerSigningOutcome<T>) => void>();
  act(() => {
    void start().then(settled);
  });
  return { settled };
}

async function flushOutcomes() {
  await act(() => Promise.resolve());
}

function getActiveBitcoinSigningRequest(rendered: ReturnType<typeof renderFlow>) {
  const request = rendered.value.flow.request;
  if (request?.kind !== 'sign-bitcoin-tx') throw new Error('No active bitcoin signing request');
  return request;
}

describe(LedgerFlowProvider.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.isPopupMode = true;
    h.search = '';
    h.consumeHandoff.mockResolvedValue(null);
  });

  test('starts with no active flow', () => {
    const rendered = renderFlow();

    expect(rendered.value.flow.request).toBeNull();
    expect(rendered.value.state).toBeNull();
  });

  test('sign assigns an id and starts signing flows on the connect step', () => {
    const rendered = renderFlow();

    startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));

    expect(rendered.value.flow.request).toMatchObject({ kind: 'sign-bitcoin-tx', id: 1 });
    expect(rendered.value.state?.step).toEqual({ name: 'connect', retryImmediately: false });
  });

  test('open starts a bitcoin key request on the connect step, retrying when asked', () => {
    const rendered = renderFlow();

    act(() =>
      rendered.value.flow.open({ kind: 'request-keys', chain: 'bitcoin', autoConnect: true })
    );

    expect(rendered.value.state?.step).toEqual({ name: 'connect', retryImmediately: true });
  });

  test('open starts a stacks key request on the address standard step', () => {
    const rendered = renderFlow();

    act(() =>
      rendered.value.flow.open({ kind: 'request-keys', chain: 'stacks', autoConnect: false })
    );

    expect(rendered.value.state?.step).toEqual({
      name: 'choose-address-standard',
      connectImmediatelyAfter: false,
    });
  });

  test('re-signing assigns a fresh id so the flow remounts', () => {
    const rendered = renderFlow();

    startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));
    startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));

    expect(rendered.value.flow.request?.id).toBe(2);
  });

  test('steps update the active flow', () => {
    const rendered = renderFlow();
    startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));

    act(() => rendered.value.steps.toDeviceBusyStep('Busy…', 'bc1q'));

    expect(rendered.value.state?.step).toEqual({
      name: 'device-busy',
      description: 'Busy…',
      address: 'bc1q',
    });
  });

  test('toConnectStepAndTryAgain asks the connect step to retry immediately', () => {
    const rendered = renderFlow();
    startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));

    act(() => rendered.value.steps.toConnectStepAndTryAgain());

    expect(rendered.value.state?.step).toEqual({ name: 'connect', retryImmediately: true });
  });

  test('steps captured for a previous flow do not affect a newer one', () => {
    const rendered = renderFlow();
    startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));
    const staleSteps = rendered.value.steps;
    startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));

    act(() => staleSteps.toDeviceBusyStep('stale'));

    expect(rendered.value.state?.step).toEqual({ name: 'connect', retryImmediately: false });
  });

  test('steps are ignored when no flow is open', () => {
    const rendered = renderFlow();

    act(() => rendered.value.steps.toDeviceBusyStep('nothing open'));

    expect(rendered.value.state).toBeNull();
  });

  test('cancelLedgerAction closes the flow and settles it as cancelled', async () => {
    const rendered = renderFlow();
    const { settled } = startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));

    act(() => rendered.value.steps.cancelLedgerAction());
    await flushOutcomes();

    expect(rendered.value.flow.request).toBeNull();
    expect(settled.mock.calls).toEqual([[{ status: 'cancelled' }]]);
  });

  test.each([
    ['bitcoin transaction', signBitcoinTxRequest],
    ['stacks transaction', signStacksTxRequest],
    ['stacks message', signStacksMessageRequest],
  ] as const)('closing a %s signing flow settles it as cancelled', async (_, request) => {
    const rendered = renderFlow();
    const { settled } = startSigning(() => rendered.value.flow.sign(request));

    act(() => rendered.value.flow.close());
    await flushOutcomes();

    expect(rendered.value.state).toBeNull();
    expect(settled.mock.calls).toEqual([[{ status: 'cancelled' }]]);
  });

  test('settling a signing flow as signed closes it and resolves the value', async () => {
    const rendered = renderFlow();
    const { settled } = startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));
    const request = getActiveBitcoinSigningRequest(rendered);
    const signedTx = new btc.Transaction();

    act(() =>
      rendered.value.steps.settleLedgerAction(request, { status: 'signed', value: signedTx })
    );
    await flushOutcomes();

    expect(rendered.value.flow.request).toBeNull();
    expect(rendered.value.state).toBeNull();
    expect(settled.mock.calls).toEqual([[{ status: 'signed', value: signedTx }]]);
  });

  test('settling a signing flow as failed forwards the error', async () => {
    const rendered = renderFlow();
    const { settled } = startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));
    const request = getActiveBitcoinSigningRequest(rendered);

    act(() =>
      rendered.value.steps.settleLedgerAction(request, { status: 'failed', error: 'boom' })
    );
    await flushOutcomes();

    expect(rendered.value.flow.request).toBeNull();
    expect(settled.mock.calls).toEqual([[{ status: 'failed', error: 'boom' }]]);
  });

  test('a signing flow settles exactly once', async () => {
    const rendered = renderFlow();
    const { settled } = startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));
    const request = getActiveBitcoinSigningRequest(rendered);

    act(() => rendered.value.steps.settleLedgerAction(request, { status: 'cancelled' }));
    act(() => rendered.value.steps.settleLedgerAction(request, { status: 'dismissed' }));
    act(() => rendered.value.flow.close());
    act(() => rendered.value.flow.closeWithError('late'));
    await flushOutcomes();

    expect(settled.mock.calls).toEqual([[{ status: 'cancelled' }]]);
  });

  test('settling a previous request does not settle or close a newer one', async () => {
    const rendered = renderFlow();
    startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));
    const staleRequest = getActiveBitcoinSigningRequest(rendered);
    const { settled } = startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));

    act(() => rendered.value.steps.settleLedgerAction(staleRequest, { status: 'cancelled' }));
    await flushOutcomes();

    expect(rendered.value.flow.request).toMatchObject({ kind: 'sign-bitcoin-tx', id: 2 });
    expect(settled).not.toHaveBeenCalled();
  });

  test('closing a signing flow with an error settles it as failed', async () => {
    const rendered = renderFlow();
    const { settled } = startSigning(() => rendered.value.flow.sign(signStacksMessageRequest));

    act(() => rendered.value.flow.closeWithError('No account'));
    await flushOutcomes();

    expect(rendered.value.flow.request).toBeNull();
    expect(settled.mock.calls).toEqual([[{ status: 'failed', error: 'No account' }]]);
  });

  test('dismissLedgerAction closes the flow and settles it as dismissed', async () => {
    const rendered = renderFlow();
    const { settled } = startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));
    act(() => rendered.value.steps.toOperationRejectedStep());

    act(() => rendered.value.steps.dismissLedgerAction());
    await flushOutcomes();

    expect(rendered.value.flow.request).toBeNull();
    expect(rendered.value.state).toBeNull();
    expect(settled.mock.calls).toEqual([[{ status: 'dismissed' }]]);
  });

  test('closing, dismissing or failing a non-signing flow closes it', () => {
    const rendered = renderFlow();

    act(() => rendered.value.flow.open(requestKeysRequest));
    act(() => rendered.value.flow.close());
    expect(rendered.value.flow.request).toBeNull();

    act(() => rendered.value.flow.open(requestKeysRequest));
    act(() => rendered.value.steps.dismissLedgerAction());
    expect(rendered.value.flow.request).toBeNull();

    act(() => rendered.value.flow.open(requestKeysRequest));
    act(() => rendered.value.flow.closeWithError('boom'));
    expect(rendered.value.flow.request).toBeNull();
  });

  test('closing when no flow is open keeps it closed', () => {
    const rendered = renderFlow();

    act(() => rendered.value.flow.close());

    expect(rendered.value.state).toBeNull();
  });

  test('opening another flow over an active signing flow settles it as cancelled', async () => {
    const rendered = renderFlow();
    const { settled } = startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));

    act(() => rendered.value.flow.open(requestKeysRequest));
    await flushOutcomes();

    expect(rendered.value.flow.request).toMatchObject({ kind: 'request-keys', id: 2 });
    expect(settled.mock.calls).toEqual([[{ status: 'cancelled' }]]);
  });

  test('re-signing the same request settles the previous one without closing the new flow', async () => {
    const rendered = renderFlow();
    const first = startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));

    const second = startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));
    await flushOutcomes();

    expect(first.settled.mock.calls).toEqual([[{ status: 'cancelled' }]]);
    expect(second.settled).not.toHaveBeenCalled();
    expect(rendered.value.flow.request).toMatchObject({ kind: 'sign-bitcoin-tx', id: 2 });
  });

  test('unmounting the provider settles an active signing flow as cancelled', async () => {
    const rendered = renderFlow();
    const { settled } = startSigning(() => rendered.value.flow.sign(signBitcoinTxRequest));

    rendered.unmount();
    await flushOutcomes();

    expect(settled.mock.calls).toEqual([[{ status: 'cancelled' }]]);
  });

  test('opens a handed-off flow when mounted in a full page with its token', async () => {
    h.isPopupMode = false;
    h.search = '?ledgerHandoff=abc';
    h.consumeHandoff.mockResolvedValue({ kind: 'verify-address', variant: 'stx' });

    const rendered = renderFlow();
    await act(() => Promise.resolve());

    expect(h.consumeHandoff).toHaveBeenCalledWith('abc');
    expect(rendered.value.flow.request).toMatchObject({ kind: 'verify-address', variant: 'stx' });
  });

  test('passes no token when the full page url carries none', async () => {
    h.isPopupMode = false;

    const rendered = renderFlow();
    await act(() => Promise.resolve());

    expect(h.consumeHandoff).toHaveBeenCalledWith(null);
    expect(rendered.value.flow.request).toBeNull();
  });

  test('never consumes a hand-off from popup mode', async () => {
    h.isPopupMode = true;

    renderFlow();
    await act(() => Promise.resolve());

    expect(h.consumeHandoff).not.toHaveBeenCalled();
  });
});
