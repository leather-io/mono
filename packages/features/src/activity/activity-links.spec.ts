import { describe, expect, it } from 'vitest';

import { HIRO_EXPLORER_URL, MEMPOOL_BASE_URL } from '@leather.io/constants';
import { HIRO_API_BASE_URL_NAKAMOTO_TESTNET, defaultCurrentNetwork } from '@leather.io/models';

import { getBitcoinExplorerLink, getStacksExplorerLink, makeActivityLink } from './activity-links';

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

  describe('getBitcoinExplorerLink', () => {
    it('returns mainnet link for mainnet network', () => {
      const result = getBitcoinExplorerLink({
        id: 'tx123',
        type: 'tx',
        networkPreference: 'mainnet',
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/tx/tx123`);
    });

    it('returns testnet link for testnet3 network', () => {
      const result = getBitcoinExplorerLink({
        id: 'tx456',
        type: 'tx',
        networkPreference: 'testnet3',
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/testnet/tx/tx456`);
    });

    it('returns testnet4 link for testnet4 network', () => {
      const result = getBitcoinExplorerLink({
        id: 'tx789',
        type: 'tx',
        networkPreference: 'testnet4',
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/testnet4/tx/tx789`);
    });

    it('returns signet link for signet network', () => {
      const result = getBitcoinExplorerLink({
        id: 'txabc',
        type: 'tx',
        networkPreference: 'signet',
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/signet/tx/txabc`);
    });

    it('returns the custom mempool instance link for a regtest network', () => {
      const result = getBitcoinExplorerLink({
        id: 'txdef',
        type: 'tx',
        networkPreference: 'regtest',
        bitcoinUrl: 'https://mempool.bitcoin.private-1.hiro.so/api',
      });

      expect(result).toBe('https://mempool.bitcoin.private-1.hiro.so/tx/txdef');
    });

    it('strips a proxied api path from a regtest bitcoin url', () => {
      const result = getBitcoinExplorerLink({
        id: 'txghi',
        type: 'tx',
        networkPreference: 'regtest',
        bitcoinUrl: 'https://beta.sbtc-mempool.tech/api/proxy',
      });

      expect(result).toBe('https://beta.sbtc-mempool.tech/tx/txghi');
    });

    it('returns null for a regtest bitcoind rpc url with no api path', () => {
      const result = getBitcoinExplorerLink({
        id: 'txjkl',
        type: 'tx',
        networkPreference: 'regtest',
        bitcoinUrl: 'http://localhost:18443',
      });

      expect(result).toBeNull();
    });

    it('returns null for a regtest network with no bitcoin url', () => {
      const result = getBitcoinExplorerLink({
        id: 'txmno',
        type: 'tx',
        networkPreference: 'regtest',
      });

      expect(result).toBeNull();
    });

    it('handles block type instead of tx', () => {
      const result = getBitcoinExplorerLink({
        id: 'block123',
        type: 'block',
        networkPreference: 'mainnet',
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/block/block123`);
    });

    it('returns null for unknown network', () => {
      const result = getBitcoinExplorerLink({
        id: 'tx123',
        type: 'tx',
        networkPreference: 'unknown' as any,
      });

      expect(result).toBeNull();
    });
  });

  describe('getStacksExplorerLink', () => {
    it('returns mainnet explorer link', () => {
      const result = getStacksExplorerLink({
        mode: 'mainnet',
        type: 'txid',
        value: 'tx123',
      });

      expect(result).toBe(`${HIRO_EXPLORER_URL}/txid/tx123?chain=mainnet`);
    });

    it('returns testnet explorer link', () => {
      const result = getStacksExplorerLink({
        mode: 'testnet',
        type: 'txid',
        value: 'tx456',
      });

      expect(result).toBe(`${HIRO_EXPLORER_URL}/txid/tx456?chain=testnet`);
    });

    it('handles address type instead of txid', () => {
      const result = getStacksExplorerLink({
        mode: 'mainnet',
        type: 'address',
        value: 'SP123ABC',
      });

      expect(result).toBe(`${HIRO_EXPLORER_URL}/address/SP123ABC?chain=mainnet`);
    });

    it('appends nakamoto API param when isNakamoto is true', () => {
      const result = getStacksExplorerLink({
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

      const result = getStacksExplorerLink({
        mode: 'mainnet',
        type: 'txid',
        value: 'txabc',
        searchParams,
      });

      expect(result).toBe(`${HIRO_EXPLORER_URL}/txid/txabc?custom=value&chain=mainnet`);
    });

    it('returns localhost link for regtest with txid', () => {
      const result = getStacksExplorerLink({
        mode: 'regtest',
        type: 'txid',
        value: 'tx123',
      });

      expect(result).toBe('http://localhost:8000/txid/tx123');
    });

    it('returns regular explorer link for regtest with address', () => {
      const result = getStacksExplorerLink({
        mode: 'regtest',
        type: 'address',
        value: 'ST123ABC',
      });

      expect(result).toBe(`${HIRO_EXPLORER_URL}/address/ST123ABC?chain=regtest`);
    });
  });
});
