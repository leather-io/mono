// @vitest-environment jsdom
import type { Location } from 'react-router';

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { RouteUrls } from '@shared/route-urls';

import { useLedgerNavigate } from './use-ledger-navigate';

const h = vi.hoisted(() => ({
  navigate: vi.fn(),
  location: { pathname: '/', search: '', hash: '', state: null, key: 'default' },
}));

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => h.navigate, useLocation: () => h.location };
});

const stacksTx = '00'.repeat(8);
const psbt = Uint8Array.from([0x70, 0x73, 0x62, 0x74, 0xff]);
const psbtHex = '70736274ff';

function setLocation(pathname: string): Location {
  h.location = { pathname, search: '', hash: '', state: null, key: 'default' };
  return h.location;
}

function renderLedgerNavigate() {
  return renderHook(() => useLedgerNavigate()).result.current;
}

describe(useLedgerNavigate.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toConnectAndSignStacksTransactionStep', () => {
    test('targets the stacks ledger flow nested under the swap review', () => {
      setLocation('/swap/stacks/STX/aeUSDC/review');

      renderLedgerNavigate().toConnectAndSignStacksTransactionStep(stacksTx);

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

      renderLedgerNavigate().toConnectAndSignStacksTransactionStep(stacksTx);

      expect(h.navigate.mock.calls[0][0]).toBe(
        '/swap/stacks/STX/aeUSDC/review/stacks/connect-your-ledger'
      );
    });

    test('keeps the relative connect step outside the swap review', () => {
      setLocation('/send/stx/confirm');

      renderLedgerNavigate().toConnectAndSignStacksTransactionStep(stacksTx);

      expect(h.navigate).toHaveBeenCalledWith(
        RouteUrls.ConnectLedger,
        expect.objectContaining({ state: { tx: stacksTx, settleOnRejection: false } })
      );
    });

    test('keeps the relative connect step on the swap form', () => {
      setLocation('/swap/stacks/STX/aeUSDC');

      renderLedgerNavigate().toConnectAndSignStacksTransactionStep(stacksTx);

      expect(h.navigate.mock.calls[0][0]).toBe(RouteUrls.ConnectLedger);
    });
  });

  describe('toConnectAndSignBitcoinTransactionStep', () => {
    test('targets the bitcoin ledger flow nested under the swap review', () => {
      const fromLocation = setLocation('/swap/bitcoin/BTC/sBTC/review');

      renderLedgerNavigate().toConnectAndSignBitcoinTransactionStep(psbt, [], fromLocation);

      expect(h.navigate).toHaveBeenCalledWith(
        '/swap/bitcoin/BTC/sBTC/review/bitcoin/connect-your-ledger',
        expect.objectContaining({
          replace: true,
          state: expect.objectContaining({
            tx: psbtHex,
            inputsToSign: [],
            fromLocation,
            settleOnRejection: true,
          }),
        })
      );
    });

    test('keeps the relative connect step outside the swap review', () => {
      const fromLocation = setLocation('/send/btc/confirm');

      renderLedgerNavigate().toConnectAndSignBitcoinTransactionStep(psbt, [], fromLocation);

      expect(h.navigate).toHaveBeenCalledWith(
        RouteUrls.ConnectLedger,
        expect.objectContaining({
          state: expect.objectContaining({ tx: psbtHex, settleOnRejection: false }),
        })
      );
    });
  });
});
