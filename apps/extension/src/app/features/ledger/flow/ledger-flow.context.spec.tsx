// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { RouteUrls } from '@shared/route-urls';

import {
  LedgerFlowProvider,
  useLedgerFlow,
  useLedgerFlowState,
  useLedgerSteps,
} from './ledger-flow.context';
import type { LedgerFlowRequest } from './ledger-flow.types';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const h = vi.hoisted(() => ({
  navigate: vi.fn(),
  consumeHandoff: vi.fn(),
  publish: vi.fn(),
  isPopupMode: true,
  search: '',
}));

vi.mock('react-router', () => ({
  useNavigate: () => h.navigate,
  useSearchParams: () => [new URLSearchParams(h.search)],
}));

vi.mock('@app/common/publish-subscribe', () => ({ appEvents: { publish: h.publish } }));

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
  };
}

const signBitcoinTxRequest: LedgerFlowRequest = {
  kind: 'sign-bitcoin-tx',
  psbt: new Uint8Array([1, 2, 3]),
  inputsToSign: [],
  settleOnRejection: false,
};

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

  test('open assigns an id and starts signing flows on the connect step', () => {
    const rendered = renderFlow();

    act(() => rendered.value.flow.open(signBitcoinTxRequest));

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

  test('re-opening assigns a fresh id so the flow remounts', () => {
    const rendered = renderFlow();

    act(() => rendered.value.flow.open(signBitcoinTxRequest));
    act(() => rendered.value.flow.open(signBitcoinTxRequest));

    expect(rendered.value.flow.request?.id).toBe(2);
  });

  test('steps update the active flow', () => {
    const rendered = renderFlow();
    act(() => rendered.value.flow.open(signBitcoinTxRequest));

    act(() => rendered.value.steps.toDeviceBusyStep('Busy…', 'bc1q'));

    expect(rendered.value.state?.step).toEqual({
      name: 'device-busy',
      description: 'Busy…',
      address: 'bc1q',
    });
  });

  test('toConnectStepAndTryAgain asks the connect step to retry immediately', () => {
    const rendered = renderFlow();
    act(() => rendered.value.flow.open(signBitcoinTxRequest));

    act(() => rendered.value.steps.toConnectStepAndTryAgain());

    expect(rendered.value.state?.step).toEqual({ name: 'connect', retryImmediately: true });
  });

  test('steps captured for a previous flow do not affect a newer one', () => {
    const rendered = renderFlow();
    act(() => rendered.value.flow.open(signBitcoinTxRequest));
    const staleSteps = rendered.value.steps;
    act(() => rendered.value.flow.open(signBitcoinTxRequest));

    act(() => staleSteps.toDeviceBusyStep('stale'));

    expect(rendered.value.state?.step).toEqual({ name: 'connect', retryImmediately: false });
  });

  test('steps are ignored when no flow is open', () => {
    const rendered = renderFlow();

    act(() => rendered.value.steps.toDeviceBusyStep('nothing open'));

    expect(rendered.value.state).toBeNull();
  });

  test('cancelLedgerAction closes the flow', () => {
    const rendered = renderFlow();
    act(() => rendered.value.flow.open(signBitcoinTxRequest));

    act(() => rendered.value.steps.cancelLedgerAction());

    expect(rendered.value.flow.request).toBeNull();
    expect(h.navigate).not.toHaveBeenCalled();
  });

  test('closing a bitcoin signing flow settles its pending listener', () => {
    const rendered = renderFlow();
    act(() => rendered.value.flow.open(signBitcoinTxRequest));

    act(() => rendered.value.steps.cancelLedgerAction());

    expect(h.publish).toHaveBeenCalledTimes(1);
    expect(h.publish).toHaveBeenCalledWith('ledgerBitcoinTxSigningCancelled', {
      unsignedPsbt: '010203',
    });
  });

  test('closing a stacks signing flow settles its pending listener', () => {
    const rendered = renderFlow();
    act(() =>
      rendered.value.flow.open({ kind: 'sign-stacks-tx', tx: 'deadbeef', settleOnRejection: false })
    );

    act(() => rendered.value.flow.close());

    expect(h.publish).toHaveBeenCalledWith('ledgerStacksTxSigningCancelled', {
      unsignedTx: 'deadbeef',
    });
  });

  test('closing a stacks message signing flow settles its pending listener', () => {
    const rendered = renderFlow();
    const message = { messageType: 'utf8', message: 'hello' } as const;
    act(() => rendered.value.flow.open({ kind: 'sign-stacks-message', message }));

    act(() => rendered.value.flow.close());

    expect(h.publish).toHaveBeenCalledWith('ledgerStacksMessageSigningCancelled', {
      unsignedMessage: message,
    });
  });

  test('closing a bitcoin signing flow with an error forwards it to the listener', () => {
    const rendered = renderFlow();
    act(() => rendered.value.flow.open(signBitcoinTxRequest));

    act(() => rendered.value.flow.closeWithError('Invalid PSBT'));

    expect(rendered.value.flow.request).toBeNull();
    expect(h.publish).toHaveBeenCalledTimes(1);
    expect(h.publish).toHaveBeenCalledWith('ledgerBitcoinTxSigningCancelled', {
      unsignedPsbt: '010203',
      error: 'Invalid PSBT',
    });
  });

  test('closing a stacks signing flow with an error forwards it to the listener', () => {
    const rendered = renderFlow();
    act(() =>
      rendered.value.flow.open({ kind: 'sign-stacks-tx', tx: 'deadbeef', settleOnRejection: false })
    );

    act(() => rendered.value.flow.closeWithError('Invalid transaction'));

    expect(h.publish).toHaveBeenCalledWith('ledgerStacksTxSigningCancelled', {
      unsignedTx: 'deadbeef',
      error: 'Invalid transaction',
    });
  });

  test('closing a stacks message signing flow with an error forwards it to the listener', () => {
    const rendered = renderFlow();
    const message = { messageType: 'utf8', message: 'hello' } as const;
    act(() => rendered.value.flow.open({ kind: 'sign-stacks-message', message }));

    act(() => rendered.value.flow.closeWithError('No account'));

    expect(h.publish).toHaveBeenCalledWith('ledgerStacksMessageSigningCancelled', {
      unsignedMessage: message,
      error: 'No account',
    });
  });

  test('closing a non-signing flow with an error publishes nothing', () => {
    const rendered = renderFlow();
    act(() =>
      rendered.value.flow.open({ kind: 'request-keys', chain: 'bitcoin', autoConnect: false })
    );

    act(() => rendered.value.flow.closeWithError('boom'));

    expect(rendered.value.flow.request).toBeNull();
    expect(h.publish).not.toHaveBeenCalled();
  });

  test('closing a non-signing flow publishes nothing', () => {
    const rendered = renderFlow();
    act(() =>
      rendered.value.flow.open({ kind: 'request-keys', chain: 'bitcoin', autoConnect: false })
    );

    act(() => rendered.value.flow.close());

    expect(h.publish).not.toHaveBeenCalled();
  });

  test('closing when no flow is open publishes nothing', () => {
    const rendered = renderFlow();

    act(() => rendered.value.flow.close());

    expect(h.publish).not.toHaveBeenCalled();
  });

  test('re-opening over an active signing flow settles the previous listener', () => {
    const rendered = renderFlow();
    act(() => rendered.value.flow.open(signBitcoinTxRequest));

    act(() =>
      rendered.value.flow.open({ kind: 'request-keys', chain: 'bitcoin', autoConnect: false })
    );

    expect(h.publish).toHaveBeenCalledTimes(1);
    expect(h.publish).toHaveBeenCalledWith('ledgerBitcoinTxSigningCancelled', {
      unsignedPsbt: '010203',
    });
  });

  test('cancelLedgerActionAndReturnHome closes the flow and navigates home', () => {
    const rendered = renderFlow();
    act(() => rendered.value.flow.open(signBitcoinTxRequest));

    act(() => rendered.value.steps.cancelLedgerActionAndReturnHome());

    expect(rendered.value.flow.request).toBeNull();
    expect(h.navigate).toHaveBeenCalledWith(RouteUrls.Home);
  });

  test('opens a handed-off flow when mounted in a full page with its token', async () => {
    h.isPopupMode = false;
    h.search = '?ledgerHandoff=abc';
    h.consumeHandoff.mockResolvedValue({ kind: 'verify-address', variant: 'stx' });

    const rendered = renderFlow();
    await act(async () => {});

    expect(h.consumeHandoff).toHaveBeenCalledWith('abc');
    expect(rendered.value.flow.request).toMatchObject({ kind: 'verify-address', variant: 'stx' });
  });

  test('passes no token when the full page url carries none', async () => {
    h.isPopupMode = false;

    const rendered = renderFlow();
    await act(async () => {});

    expect(h.consumeHandoff).toHaveBeenCalledWith(null);
    expect(rendered.value.flow.request).toBeNull();
  });

  test('never consumes a hand-off from popup mode', async () => {
    h.isPopupMode = true;

    renderFlow();
    await act(async () => {});

    expect(h.consumeHandoff).not.toHaveBeenCalled();
  });
});
