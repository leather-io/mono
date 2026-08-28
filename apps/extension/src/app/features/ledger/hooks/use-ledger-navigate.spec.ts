// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { RouteUrls } from '@shared/route-urls';

import { useLedgerNavigate } from './use-ledger-navigate';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const h = vi.hoisted(() => ({
  navigate: vi.fn(),
  location: { pathname: '/', state: null as unknown },
}));

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => h.navigate, useLocation: () => h.location };
});

const fromLocation = { pathname: '/verify-from-here', state: { origin: 'asset-list' } };

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

function setLocation(pathname: string, state: unknown) {
  h.location = { pathname, state };
}

describe(useLedgerNavigate.name, () => {
  beforeEach(() => {
    h.navigate.mockReset();
    setLocation('/', null);
  });

  test('toConnectStep carries fromLocation so cancel returns to the origin', () => {
    setLocation(`/bitcoin/${RouteUrls.ConnectLedger}`, {
      backgroundLocation: { pathname: RouteUrls.Home },
      fromLocation,
    });
    const { getValue } = renderHookValue(useLedgerNavigate);

    void getValue().toConnectStep();

    expect(h.navigate).toHaveBeenCalledWith(RouteUrls.ConnectLedger, {
      replace: true,
      state: { backgroundLocation: { pathname: RouteUrls.Home }, fromLocation },
    });
  });

  test('toConnectStep leaves fromLocation undefined when the origin is unknown', () => {
    setLocation(`/bitcoin/${RouteUrls.ConnectLedger}`, {
      backgroundLocation: { pathname: RouteUrls.Home },
    });
    const { getValue } = renderHookValue(useLedgerNavigate);

    void getValue().toConnectStep();

    expect(h.navigate).toHaveBeenCalledWith(RouteUrls.ConnectLedger, {
      replace: true,
      state: { backgroundLocation: { pathname: RouteUrls.Home }, fromLocation: undefined },
    });
  });

  test('toErrorStep carries fromLocation the same way', () => {
    setLocation(`/bitcoin/${RouteUrls.ConnectLedger}`, { fromLocation });
    const { getValue } = renderHookValue(useLedgerNavigate);

    void getValue().toErrorStep('bitcoin', 'boom');

    expect(h.navigate).toHaveBeenCalledWith(RouteUrls.ConnectLedgerError, {
      replace: true,
      state: {
        latestLedgerError: 'boom',
        chain: 'bitcoin',
        backgroundLocation: { pathname: RouteUrls.Home },
        fromLocation,
      },
    });
  });

  test('cancelLedgerAction navigates back to fromLocation when present', () => {
    setLocation(`/bitcoin/${RouteUrls.ConnectLedger}`, { fromLocation });
    const { getValue } = renderHookValue(useLedgerNavigate);

    void getValue().cancelLedgerAction();

    expect(h.navigate).toHaveBeenCalledWith(fromLocation, {
      replace: true,
      state: { ...fromLocation.state, wentBack: true },
    });
  });

  test('cancelLedgerAction falls back to the parent path without fromLocation', () => {
    setLocation(`/bitcoin/${RouteUrls.ConnectLedger}`, {
      backgroundLocation: { pathname: RouteUrls.Home },
    });
    const { getValue } = renderHookValue(useLedgerNavigate);

    void getValue().cancelLedgerAction();

    expect(h.navigate).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/bitcoin' }),
      expect.objectContaining({ relative: 'path', replace: true })
    );
  });
});
