import { describe, expect, it } from 'vitest';

import { HIRO_EXPLORER_URL, MEMPOOL_BASE_URL } from '@leather.io/constants';
import { HIRO_API_BASE_URL_NAKAMOTO_TESTNET, defaultCurrentNetwork } from '@leather.io/models';

import { getHiroExplorerLink, getMempoolExplorerLink, makeActivityLink } from './activity-links';

describe('activity-links', () => {
  describe('makeActivityLink', () => {
    it('returns Bitcoin explorer link for Bitcoin asset', () => {
      const result = makeActivityLink({
        txid: 'abc123',
        networkPreference: defaultCurrentNetwork,
        asset: {
          chain: 'bitcoin',
          category: 'fungible',
          protocol: 'nativeBtc',
          name: 'Bitcoin',
          symbol: 'BTC',
          decimals: 8,
          hasMemo: false,
        },
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/tx/abc123`);
    });

    it('returns Stacks explorer link for Stacks asset', () => {
      const result = makeActivityLink({
        txid: 'def456',
        networkPreference: defaultCurrentNetwork,
        asset: {
          chain: 'stacks',
          category: 'fungible',
          protocol: 'nativeStx',
          name: 'Stacks',
          symbol: 'STX',
          decimals: 6,
          hasMemo: false,
        },
      });

      expect(result).toBe(`${HIRO_EXPLORER_URL}/txid/def456?chain=mainnet`);
    });

    it('returns null when asset is missing', () => {
      const result = makeActivityLink({
        txid: 'abc123',
        networkPreference: defaultCurrentNetwork,
      });

      expect(result).toBeNull();
    });

    it('returns null when txid is empty', () => {
      const result = makeActivityLink({
        txid: '',
        networkPreference: defaultCurrentNetwork,
        asset: {
          chain: 'bitcoin',
          category: 'fungible',
          protocol: 'nativeBtc',
          name: 'Bitcoin',
          symbol: 'BTC',
          decimals: 8,
          hasMemo: false,
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('getMempoolExplorerLink', () => {
    it('returns mainnet link for mainnet network', () => {
      const result = getMempoolExplorerLink({
        id: 'tx123',
        type: 'tx',
        networkPreference: 'mainnet',
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/tx/tx123`);
    });

    it('returns testnet link for testnet3 network', () => {
      const result = getMempoolExplorerLink({
        id: 'tx456',
        type: 'tx',
        networkPreference: 'testnet3',
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/testnet/tx/tx456`);
    });

    it('returns testnet4 link for testnet4 network', () => {
      const result = getMempoolExplorerLink({
        id: 'tx789',
        type: 'tx',
        networkPreference: 'testnet4',
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/testnet4/tx/tx789`);
    });

    it('returns signet link for signet network', () => {
      const result = getMempoolExplorerLink({
        id: 'txabc',
        type: 'tx',
        networkPreference: 'signet',
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/signet/tx/txabc`);
    });

    it('handles block type instead of tx', () => {
      const result = getMempoolExplorerLink({
        id: 'block123',
        type: 'block',
        networkPreference: 'mainnet',
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/block/block123`);
    });

    it('returns null for unknown network', () => {
      const result = getMempoolExplorerLink({
        id: 'tx123',
        type: 'tx',
        networkPreference: 'unknown' as any,
      });

      expect(result).toBeNull();
    });
  });

  describe('getHiroExplorerLink', () => {
    it('returns mainnet explorer link', () => {
      const result = getHiroExplorerLink({
        mode: 'mainnet',
        type: 'txid',
        value: 'tx123',
      });

      expect(result).toBe(`${HIRO_EXPLORER_URL}/txid/tx123?chain=mainnet`);
    });

    it('returns testnet explorer link', () => {
      const result = getHiroExplorerLink({
        mode: 'testnet',
        type: 'txid',
        value: 'tx456',
      });

      expect(result).toBe(`${HIRO_EXPLORER_URL}/txid/tx456?chain=testnet`);
    });

    it('handles address type instead of txid', () => {
      const result = getHiroExplorerLink({
        mode: 'mainnet',
        type: 'address',
        value: 'SP123ABC',
      });

      expect(result).toBe(`${HIRO_EXPLORER_URL}/address/SP123ABC?chain=mainnet`);
    });

    it('appends nakamoto API param when isNakamoto is true', () => {
      const result = getHiroExplorerLink({
        mode: 'testnet',
        type: 'txid',
        value: 'tx789',
        isNakamoto: true,
      });

      expect(result).toBe(
        `${HIRO_EXPLORER_URL}/txid/tx789?chain=testnet&api=${encodeURIComponent(HIRO_API_BASE_URL_NAKAMOTO_TESTNET)}`
      );
    });

    it('includes custom search params', () => {
      const searchParams = new URLSearchParams();
      searchParams.append('custom', 'value');

      const result = getHiroExplorerLink({
        mode: 'mainnet',
        type: 'txid',
        value: 'txabc',
        searchParams,
      });

      expect(result).toBe(`${HIRO_EXPLORER_URL}/txid/txabc?custom=value&chain=mainnet`);
    });

    it('returns localhost link for regtest with txid', () => {
      const result = getHiroExplorerLink({
        mode: 'regtest',
        type: 'txid',
        value: 'tx123',
      });

      expect(result).toBe('http://localhost:8000/txid/tx123');
    });

    it('returns regular explorer link for regtest with address', () => {
      const result = getHiroExplorerLink({
        mode: 'regtest',
        type: 'address',
        value: 'ST123ABC',
      });

      expect(result).toBe(`${HIRO_EXPLORER_URL}/address/ST123ABC?chain=regtest`);
    });
  });
});
