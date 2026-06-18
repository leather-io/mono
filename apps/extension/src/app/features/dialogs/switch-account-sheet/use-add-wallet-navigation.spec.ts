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
  pageMode: 'full' as 'full' | 'popup',
  webUsbSupported: true,
}));

vi.mock('react-router', () => ({ useNavigate: () => h.navigate }));

vi.mock('@app/common/utils/open-in-new-tab', () => ({
  openIndexPageInNewTab: h.openInNewTab,
}));

vi.mock('@shared/utils', () => ({ closeWindow: h.closeWindow }));

vi.mock('@app/common/utils', () => ({
  whenPageMode: (map: Record<'full' | 'popup', unknown>) => map[h.pageMode],
  doesBrowserSupportWebUsbApi: () => h.webUsbSupported,
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
    h.webUsbSupported = true;
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

  test('onConnectLedger closes the sheets before navigating in full-page mode', () => {
    h.pageMode = 'full';
    h.webUsbSupported = true;
    const closeSheets = vi.fn();
    const { getValue } = renderHookValue(() => useAddWalletNavigation({ closeSheets }));

    act(() => getValue().onConnectLedger());

    expect(closeSheets).toHaveBeenCalledOnce();
    expect(h.navigate).toHaveBeenCalledWith(RouteUrls.ConnectLedgerStart);
  });

  test('onConnectLedger routes to the unsupported-browser page when WebUSB is unavailable', () => {
    h.pageMode = 'full';
    h.webUsbSupported = false;
    const closeSheets = vi.fn();
    const { getValue } = renderHookValue(() => useAddWalletNavigation({ closeSheets }));

    act(() => getValue().onConnectLedger());

    expect(closeSheets).toHaveBeenCalledOnce();
    expect(h.navigate).toHaveBeenCalledWith(RouteUrls.LedgerUnsupportedBrowser);
  });

  test('onConnectLedger opens a new tab and closes the window in popup mode', () => {
    h.pageMode = 'popup';
    h.webUsbSupported = true;
    const closeSheets = vi.fn();
    const { getValue } = renderHookValue(() => useAddWalletNavigation({ closeSheets }));

    act(() => getValue().onConnectLedger());

    expect(closeSheets).toHaveBeenCalledOnce();
    expect(h.openInNewTab).toHaveBeenCalledWith(RouteUrls.ConnectLedgerStart);
    expect(h.closeWindow).toHaveBeenCalledOnce();
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
