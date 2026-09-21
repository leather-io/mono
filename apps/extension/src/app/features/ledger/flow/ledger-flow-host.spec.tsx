// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { LedgerFlowHost } from './ledger-flow-host';
import { LedgerFlowProvider, useLedgerFlow } from './ledger-flow.context';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const h = vi.hoisted(() => ({
  publish: vi.fn(),
  toastError: vi.fn(),
  logError: vi.fn(),
  consumeHandoff: vi.fn(),
  renderBitcoinContainer: vi.fn<() => null>(),
}));

vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));

vi.mock('@app/common/publish-subscribe', () => ({ appEvents: { publish: h.publish } }));

vi.mock('@app/common/utils', () => ({ isPopupMode: () => true }));

vi.mock('./ledger-flow-handoff', () => ({ consumeLedgerFlowHandoff: h.consumeHandoff }));

vi.mock('@shared/logger', () => ({ logger: { error: h.logError } }));

vi.mock('@app/features/toasts/use-toast', () => ({
  useToast: () => ({ error: h.toastError }),
}));

vi.mock('../dmk/ledger-dmk.context', () => ({
  LedgerDmkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../flows/bitcoin-tx-signing/ledger-bitcoin-sign-tx-container', () => ({
  LedgerSignBitcoinTxContainer: () => h.renderBitcoinContainer(),
}));

vi.mock('../flows/confirm-btc-policy-address/ledger-confirm-btc-policy-address', () => ({
  LedgerConfirmBtcPolicyAddress: () => null,
}));

vi.mock('../flows/request-bitcoin-keys/ledger-request-bitcoin-keys', () => ({
  LedgerRequestBitcoinKeys: () => null,
}));

vi.mock('../flows/request-stacks-keys/ledger-request-stacks-keys', () => ({
  LedgerRequestStacksKeys: () => null,
}));

vi.mock('../flows/stacks-message-signing/ledger-stacks-sign-msg-container', () => ({
  LedgerSignMsgContainer: () => null,
}));

vi.mock('../flows/stacks-tx-signing/ledger-sign-stacks-tx-container', () => ({
  LedgerSignStacksTxContainer: () => null,
}));

vi.mock('../flows/verify-address/ledger-verify-btc-address', () => ({
  LedgerVerifyBtcAddress: () => null,
}));

vi.mock('../flows/verify-address/ledger-verify-stx-address', () => ({
  LedgerVerifyStxAddress: () => null,
}));

vi.mock('../generic-steps/connect-device/connect-ledger-start', () => ({
  ConnectLedgerStart: () => null,
}));

vi.mock('../generic-steps/unsupported-browser/unsupported-browser.layout', () => ({
  UnsupportedBrowserLayout: () => null,
}));

function renderHost() {
  let flow: ReturnType<typeof useLedgerFlow> | undefined;
  function FlowCapture() {
    flow = useLedgerFlow();
    return null;
  }
  const root = createRoot(document.createElement('div'), { onCaughtError() {} });
  act(() => {
    root.render(
      createElement(
        LedgerFlowProvider,
        null,
        createElement(FlowCapture),
        createElement(LedgerFlowHost)
      )
    );
  });
  return {
    get flow() {
      if (!flow) throw new Error('Flow did not render');
      return flow;
    },
  };
}

describe(LedgerFlowHost.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.consumeHandoff.mockResolvedValue(null);
    h.renderBitcoinContainer.mockReturnValue(null);
  });

  test('renders the active flow without settling its listener', () => {
    const rendered = renderHost();

    act(() =>
      rendered.flow.open({
        kind: 'sign-bitcoin-tx',
        psbt: new Uint8Array([1, 2, 3]),
        inputsToSign: [],
        settleOnRejection: false,
      })
    );

    expect(h.renderBitcoinContainer).toHaveBeenCalled();
    expect(h.publish).not.toHaveBeenCalled();
    expect(rendered.flow.request).not.toBeNull();
  });

  test('closes a flow that fails to render and settles its listener with the error', () => {
    const rendered = renderHost();
    h.renderBitcoinContainer.mockImplementation(() => {
      throw new Error('Invalid PSBT');
    });

    act(() =>
      rendered.flow.open({
        kind: 'sign-bitcoin-tx',
        psbt: new Uint8Array([1, 2, 3]),
        inputsToSign: [],
        settleOnRejection: false,
      })
    );

    expect(rendered.flow.request).toBeNull();
    expect(h.toastError).toHaveBeenCalledOnce();
    expect(h.logError).toHaveBeenCalledOnce();
    expect(h.publish).toHaveBeenCalledTimes(1);
    expect(h.publish).toHaveBeenCalledWith('ledgerBitcoinTxSigningCancelled', {
      unsignedPsbt: '010203',
      error: 'Invalid PSBT',
    });
  });
});
