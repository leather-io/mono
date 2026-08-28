// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Location } from 'react-router';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { RouteUrls } from '@shared/route-urls';

import { useLedgerNavigate } from './use-ledger-navigate';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const h = vi.hoisted(() => ({
  navigate: vi.fn(),
  location: { pathname: '/', search: '', hash: '', state: null as unknown, key: 'default' },
}));

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => h.navigate, useLocation: () => h.location };
});

const fromLocation = { pathname: '/verify-from-here', state: { origin: 'asset-list' } };
const stacksTx = '00'.repeat(8);
const psbt = Uint8Array.from([0x70, 0x73, 0x62, 0x74, 0xff]);
const psbtHex = '70736274ff';

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

function setLocation(pathname: string, state: unknown = null): Location {
  h.location = { pathname, search: '', hash: '', state, key: 'default' };
  return h.location;
}

function renderLedgerNavigate() {
  return renderHookValue(useLedgerNavigate).getValue();
}

describe(useLedgerNavigate.name, () => {
  beforeEach(() => {
    h.navigate.mockReset();
    setLocation('/');
  });

  test('toConnectStep carries fromLocation so cancel returns to the origin', () => {
    setLocation(`/bitcoin/${RouteUrls.ConnectLedger}`, {
      backgroundLocation: { pathname: RouteUrls.Home },
      fromLocation,
    });

    void renderLedgerNavigate().toConnectStep();

    expect(h.navigate).toHaveBeenCalledWith(RouteUrls.ConnectLedger, {
      replace: true,
      state: { backgroundLocation: { pathname: RouteUrls.Home }, fromLocation },
    });
  });

  test('toConnectStep leaves fromLocation undefined when the origin is unknown', () => {
    setLocation(`/bitcoin/${RouteUrls.ConnectLedger}`, {
      backgroundLocation: { pathname: RouteUrls.Home },
    });

    void renderLedgerNavigate().toConnectStep();

    expect(h.navigate).toHaveBeenCalledWith(RouteUrls.ConnectLedger, {
      replace: true,
      state: { backgroundLocation: { pathname: RouteUrls.Home }, fromLocation: undefined },
    });
  });

  test('toErrorStep carries fromLocation the same way', () => {
    setLocation(`/bitcoin/${RouteUrls.ConnectLedger}`, { fromLocation });

    void renderLedgerNavigate().toErrorStep('bitcoin', 'boom');

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

    void renderLedgerNavigate().cancelLedgerAction();

    expect(h.navigate).toHaveBeenCalledWith(fromLocation, {
      replace: true,
      state: { ...fromLocation.state, wentBack: true },
    });
  });

  test('cancelLedgerAction falls back to the parent path without fromLocation', () => {
    setLocation(`/bitcoin/${RouteUrls.ConnectLedger}`, {
      backgroundLocation: { pathname: RouteUrls.Home },
    });

    void renderLedgerNavigate().cancelLedgerAction();

    expect(h.navigate).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/bitcoin' }),
      expect.objectContaining({ relative: 'path', replace: true })
    );
  });

  describe('toConnectAndSignStacksTransactionStep', () => {
    test('targets the stacks ledger flow nested under the swap review', () => {
      setLocation('/swap/stacks/STX/aeUSDC/review');

      void renderLedgerNavigate().toConnectAndSignStacksTransactionStep(stacksTx);

      expect(h.navigate).toHaveBeenCalledWith(
        '/swap/stacks/STX/aeUSDC/review/stacks/connect-your-ledger',
        expect.objectContaining({
          replace: true,
          state: { tx: stacksTx, settleOnRejection: true },
        })
      );
    });

    test('tolerates a trailing slash on the swap review path', () => {
      setLocation('/swap/stacks/STX/aeUSDC/review/');

      void renderLedgerNavigate().toConnectAndSignStacksTransactionStep(stacksTx);

      expect(h.navigate.mock.calls[0][0]).toBe(
        '/swap/stacks/STX/aeUSDC/review/stacks/connect-your-ledger'
      );
    });

    test('keeps the relative connect step outside the swap review', () => {
      setLocation('/send/stx/confirm');

      void renderLedgerNavigate().toConnectAndSignStacksTransactionStep(stacksTx);

      expect(h.navigate).toHaveBeenCalledWith(
        RouteUrls.ConnectLedger,
        expect.objectContaining({ state: { tx: stacksTx, settleOnRejection: false } })
      );
    });

    test('keeps the relative connect step on the swap form', () => {
      setLocation('/swap/stacks/STX/aeUSDC');

      void renderLedgerNavigate().toConnectAndSignStacksTransactionStep(stacksTx);

      expect(h.navigate.mock.calls[0][0]).toBe(RouteUrls.ConnectLedger);
    });
  });

  describe('toConnectAndSignBitcoinTransactionStep', () => {
    test('targets the bitcoin ledger flow nested under the swap review', () => {
      const swapFromLocation = setLocation('/swap/bitcoin/BTC/sBTC/review');

      void renderLedgerNavigate().toConnectAndSignBitcoinTransactionStep(
        psbt,
        [],
        swapFromLocation
      );

      expect(h.navigate).toHaveBeenCalledWith(
        '/swap/bitcoin/BTC/sBTC/review/bitcoin/connect-your-ledger',
        expect.objectContaining({
          replace: true,
          state: expect.objectContaining({
            tx: psbtHex,
            inputsToSign: [],
            fromLocation: swapFromLocation,
            settleOnRejection: true,
          }),
        })
      );
    });

    test('keeps the relative connect step outside the swap review', () => {
      const sendFromLocation = setLocation('/send/btc/confirm');

      void renderLedgerNavigate().toConnectAndSignBitcoinTransactionStep(
        psbt,
        [],
        sendFromLocation
      );

      expect(h.navigate).toHaveBeenCalledWith(
        RouteUrls.ConnectLedger,
        expect.objectContaining({
          state: expect.objectContaining({ tx: psbtHex, settleOnRejection: false }),
        })
      );
    });
  });
});
