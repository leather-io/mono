import { describe, expect, it } from 'vitest';

import { HIRO_EXPLORER_URL, MEMPOOL_BASE_URL } from '@leather.io/constants';
import {
  BITCOIN_API_BASE_URL_SIGNET,
  BITCOIN_API_BASE_URL_TESTNET3,
  type CryptoAsset,
  HIRO_API_BASE_URL_NAKAMOTO_TESTNET,
  HIRO_API_BASE_URL_STAKING_TESTNET,
  defaultCurrentNetwork,
  defaultNetworksKeyedById,
} from '@leather.io/models';

import {
  getBitcoinExplorerLink,
  getStacksExplorerLink,
  getStacksExplorerMode,
  makeActivityLink,
} from './activity-links';

const stakingTestnet = defaultNetworksKeyedById.stakingTestnet;
const private1 = defaultNetworksKeyedById['private-1'];
const stakingTestnetTxid = 'f8db89ec73cc42cc5d2b60395c804e14c4a3c5170a4e0eb9b4e5d232049f4164';
const stakingTestnetStacksTxid =
  '0xda127571bdd6d8f489a1ceb71ac15a3e9a7f781529ba58199090bee3bc09844c';
const stakingTestnetStacksApiParam = `api=${encodeURIComponent(HIRO_API_BASE_URL_STAKING_TESTNET)}`;

const btcAsset: CryptoAsset = {
  chain: 'bitcoin',
  category: 'fungible',
  protocol: 'nativeBtc',
  name: 'Bitcoin',
  symbol: 'BTC',
  decimals: 8,
  hasMemo: false,
};

const stxAsset: CryptoAsset = {
  chain: 'stacks',
  category: 'fungible',
  protocol: 'nativeStx',
  name: 'Stacks',
  symbol: 'STX',
  decimals: 6,
  hasMemo: false,
};

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

    it('returns the staking testnet mempool link for a bitcoin asset on the staking testnet', () => {
      const result = makeActivityLink({
        txid: stakingTestnetTxid,
        networkPreference: stakingTestnet,
        asset: btcAsset,
      });

      expect(result).toBe(
        `https://mempool.bitcoin.staking-testnet.hiro.so/tx/${stakingTestnetTxid}`
      );
    });

    it('returns a testnet explorer link with the staking testnet api for a stacks asset', () => {
      const result = makeActivityLink({
        txid: stakingTestnetStacksTxid,
        networkPreference: stakingTestnet,
        asset: stxAsset,
      });

      expect(result).toBe(
        `${HIRO_EXPLORER_URL}/txid/${stakingTestnetStacksTxid}?chain=testnet&${stakingTestnetStacksApiParam}`
      );
    });

    it('returns a testnet explorer link without an api param for public signet', () => {
      const result = makeActivityLink({
        txid: 'def456',
        networkPreference: defaultNetworksKeyedById.signet,
        asset: stxAsset,
      });

      expect(result).toBe(`${HIRO_EXPLORER_URL}/txid/def456?chain=testnet`);
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

    it.each([
      ['tx', stakingTestnetTxid],
      ['address', 'tb1qvz04jt55sy7a4e9fg447gm2zlmnjck3d4yhelq'],
      ['block', '00000000a1b2c3'],
    ] as const)('returns a staking testnet mempool %s link', (type, id) => {
      const result = getBitcoinExplorerLink({
        id,
        type,
        networkPreference: stakingTestnet.chain.bitcoin.bitcoinNetwork,
        bitcoinUrl: stakingTestnet.chain.bitcoin.bitcoinUrl,
      });

      expect(result).toBe(`https://mempool.bitcoin.staking-testnet.hiro.so/${type}/${id}`);
    });

    it.each([
      ['tx', 'txpriv'],
      ['address', 'bcrt1qprivate'],
      ['block', 'blockpriv'],
    ] as const)('returns a private-1 mempool %s link', (type, id) => {
      const result = getBitcoinExplorerLink({
        id,
        type,
        networkPreference: private1.chain.bitcoin.bitcoinNetwork,
        bitcoinUrl: private1.chain.bitcoin.bitcoinUrl,
      });

      expect(result).toBe(`https://mempool.bitcoin.private-1.hiro.so/${type}/${id}`);
    });

    it.each([
      ['tx', 'txsig'],
      ['address', 'tb1qsignet'],
      ['block', 'blocksig'],
    ] as const)('keeps the public signet %s link for the public signet api', (type, id) => {
      const result = getBitcoinExplorerLink({
        id,
        type,
        networkPreference: 'signet',
        bitcoinUrl: BITCOIN_API_BASE_URL_SIGNET,
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/signet/${type}/${id}`);
    });

    it('keeps the public testnet link for the leather mempool testnet3 api', () => {
      const result = getBitcoinExplorerLink({
        id: 'tx456',
        type: 'tx',
        networkPreference: 'testnet3',
        bitcoinUrl: BITCOIN_API_BASE_URL_TESTNET3,
      });

      expect(result).toBe(`${MEMPOOL_BASE_URL}/testnet/tx/tx456`);
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

    it('appends the api param when the stacks api is not the default for the chain', () => {
      const result = getStacksExplorerLink({
        mode: 'testnet',
        type: 'txid',
        value: stakingTestnetStacksTxid,
        stacksApiUrl: HIRO_API_BASE_URL_STAKING_TESTNET,
      });

      expect(result).toBe(
        `${HIRO_EXPLORER_URL}/txid/${stakingTestnetStacksTxid}?chain=testnet&${stakingTestnetStacksApiParam}`
      );
    });

    it('appends the api param to address links', () => {
      const result = getStacksExplorerLink({
        mode: 'testnet',
        type: 'address',
        value: 'ST123ABC.contract',
        stacksApiUrl: HIRO_API_BASE_URL_STAKING_TESTNET,
      });

      expect(result).toBe(
        `${HIRO_EXPLORER_URL}/address/ST123ABC.contract?chain=testnet&${stakingTestnetStacksApiParam}`
      );
    });

    it('omits the api param for the default hiro api, ignoring a trailing slash', () => {
      expect(
        getStacksExplorerLink({
          mode: 'mainnet',
          type: 'txid',
          value: 'tx123',
          stacksApiUrl: 'https://api.hiro.so/',
        })
      ).toBe(`${HIRO_EXPLORER_URL}/txid/tx123?chain=mainnet`);
      expect(
        getStacksExplorerLink({
          mode: 'testnet',
          type: 'txid',
          value: 'tx456',
          stacksApiUrl: 'https://api.testnet.hiro.so',
        })
      ).toBe(`${HIRO_EXPLORER_URL}/txid/tx456?chain=testnet`);
    });

    it('strips a trailing slash from a custom api', () => {
      const result = getStacksExplorerLink({
        mode: 'testnet',
        type: 'txid',
        value: 'tx789',
        stacksApiUrl: `${HIRO_API_BASE_URL_STAKING_TESTNET}/`,
      });

      expect(result).toBe(
        `${HIRO_EXPLORER_URL}/txid/tx789?chain=testnet&${stakingTestnetStacksApiParam}`
      );
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

  describe('getStacksExplorerMode', () => {
    it('derives the chain from the stacks chain id, not the bitcoin mode', () => {
      expect(getStacksExplorerMode(defaultNetworksKeyedById.mainnet)).toBe('mainnet');
      expect(getStacksExplorerMode(defaultNetworksKeyedById.testnet)).toBe('testnet');
      expect(getStacksExplorerMode(defaultNetworksKeyedById.signet)).toBe('testnet');
      expect(getStacksExplorerMode(stakingTestnet)).toBe('testnet');
    });

    it('keeps regtest networks on regtest', () => {
      expect(getStacksExplorerMode(defaultNetworksKeyedById.devnet)).toBe('regtest');
    });
  });
});
