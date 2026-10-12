// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { RouteUrls } from '@shared/route-urls';

import { useAddWalletNavigation } from './use-add-wallet-navigation';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const h = vi.hoisted(() => ({
  navigate: vi.fn(),
  openInNewTab: vi.fn(),
  closeWindow: vi.fn(),
  openLedgerFlow: vi.fn(),
  handOffLedgerFlow: vi.fn(),
  pageMode: 'full' as 'full' | 'popup',
  webHidSupported: true,
}));

vi.mock('react-router', () => ({ useNavigate: () => h.navigate }));

vi.mock('@app/common/utils/open-in-new-tab', () => ({
  openIndexPageInNewTab: h.openInNewTab,
}));

vi.mock('@shared/utils', () => ({ closeWindow: h.closeWindow }));

vi.mock('@app/features/ledger/flow/ledger-flow.context', () => ({
  useLedgerFlow: () => ({ open: h.openLedgerFlow }),
}));

vi.mock('@app/features/ledger/flow/ledger-flow-handoff', () => ({
  handOffLedgerFlowToFullPage: h.handOffLedgerFlow,
}));

vi.mock('@app/common/utils', () => ({
  whenPageMode: (map: Record<'full' | 'popup', unknown>) => map[h.pageMode],
  doesBrowserSupportWebHidApi: () => h.webHidSupported,
}));

function renderHookValue<T>(useHook: () => T) {
  let value: T | undefined;
  function TestComponent() {
    value = useHook();
    return null;
  }
  const root = createRoot(document.createElement('div'));
  act(() => {
    root.render(createElement(TestComponent));
  });
  return {
    getValue(): T {
      if (value === undefined) throw new Error('Hook did not render a value');
      return value;
    },
  };
}

describe('useAddWalletNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.pageMode = 'full';
    h.webHidSupported = true;
  });

  test('onCreateNewWallet closes the sheets before navigating to create wallet', () => {
    const closeSheets = vi.fn();
    const { getValue } = renderHookValue(() => useAddWalletNavigation({ closeSheets }));

    act(() => getValue().onCreateNewWallet());

    expect(closeSheets).toHaveBeenCalledOnce();
    expect(h.navigate).toHaveBeenCalledWith(RouteUrls.CreateWallet);
  });

  test('onRestoreWallet closes the sheets before navigating to add wallet', () => {
    const closeSheets = vi.fn();
    const { getValue } = renderHookValue(() => useAddWalletNavigation({ closeSheets }));

    act(() => getValue().onRestoreWallet());

    expect(closeSheets).toHaveBeenCalledOnce();
    expect(h.navigate).toHaveBeenCalledWith(RouteUrls.AddWallet);
  });

  test('onConnectLedger closes the sheets before opening the ledger flow in full-page mode', () => {
    h.pageMode = 'full';
    h.webHidSupported = true;
    const closeSheets = vi.fn();
    const { getValue } = renderHookValue(() => useAddWalletNavigation({ closeSheets }));

    act(() => getValue().onConnectLedger());

    expect(closeSheets).toHaveBeenCalledOnce();
    expect(h.openLedgerFlow).toHaveBeenCalledWith({ kind: 'connect-start' });
    expect(h.navigate).not.toHaveBeenCalled();
  });

  test('onConnectLedger opens the unsupported-browser flow when WebHID is unavailable', () => {
    h.pageMode = 'full';
    h.webHidSupported = false;
    const closeSheets = vi.fn();
    const { getValue } = renderHookValue(() => useAddWalletNavigation({ closeSheets }));

    act(() => getValue().onConnectLedger());

    expect(closeSheets).toHaveBeenCalledOnce();
    expect(h.openLedgerFlow).toHaveBeenCalledWith({ kind: 'unsupported-browser' });
  });

  test('onConnectLedger hands the flow off to a full page in popup mode', () => {
    h.pageMode = 'popup';
    h.webHidSupported = true;
    const closeSheets = vi.fn();
    const { getValue } = renderHookValue(() => useAddWalletNavigation({ closeSheets }));

    act(() => getValue().onConnectLedger());

    expect(closeSheets).toHaveBeenCalledOnce();
    expect(h.handOffLedgerFlow).toHaveBeenCalledWith(
      { kind: 'connect-start' },
      { closeCurrentWindow: true }
    );
    expect(h.openLedgerFlow).not.toHaveBeenCalled();
    expect(h.navigate).not.toHaveBeenCalled();
  });

  test('onCreateNewWallet opens a new tab and closes the window in popup mode', () => {
    h.pageMode = 'popup';
    const closeSheets = vi.fn();
    const { getValue } = renderHookValue(() => useAddWalletNavigation({ closeSheets }));

    act(() => getValue().onCreateNewWallet());

    expect(closeSheets).toHaveBeenCalledOnce();
    expect(h.openInNewTab).toHaveBeenCalledWith(RouteUrls.CreateWallet);
    expect(h.closeWindow).toHaveBeenCalledOnce();
    expect(h.navigate).not.toHaveBeenCalled();
  });

  test('onRestoreWallet opens a new tab and closes the window in popup mode', () => {
    h.pageMode = 'popup';
    const closeSheets = vi.fn();
    const { getValue } = renderHookValue(() => useAddWalletNavigation({ closeSheets }));

    act(() => getValue().onRestoreWallet());

    expect(closeSheets).toHaveBeenCalledOnce();
    expect(h.openInNewTab).toHaveBeenCalledWith(RouteUrls.AddWallet);
    expect(h.closeWindow).toHaveBeenCalledOnce();
    expect(h.navigate).not.toHaveBeenCalled();
  });
});
