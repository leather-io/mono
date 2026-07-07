import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  AccountAddresses,
  BitcoinTransaction,
  CryptoAssetId,
  Sip10Asset,
} from '@leather.io/models';

import { Sip10AssetService } from '../assets/sip10-asset.service';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import type {
  HiroPrincipalTransaction,
  HiroPrincipalTransactionsResultItem,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import { MarketDataService } from '../market/market-data.service';
import { StacksProtocolService } from '../protocols/stacks-protocol.service';
import { BitcoinTransactionsService } from '../transactions/bitcoin-transactions.service';
import { StacksTransactionsService } from '../transactions/stacks-transactions.service';
import { BlockchainActivityService } from './blockchain-activity.service';

const emptyCursor = { next: null, previous: null, current: null };

function stxResult(
  transaction: HiroPrincipalTransaction,
  overrides: Partial<HiroPrincipalTransactionsResultItem> = {}
): HiroPrincipalTransactionsResultItem {
  return {
    transaction,
    involvement: 'sender',
    balance_changes: { stx: { sent: '0', received: '0', net: '0' } },
    affected_balances: { stx: true, ft: false, nft: false },
    ...overrides,
  };
}

function baseTx() {
  return {
    tx_id: '0x1',
    sender: { address: 'SP1', nonce: 0 },
    sponsor: null,
    fee_rate: '0',
    block: { height: 1, hash: '0x', index_hash: '0x', time: 1000, tx_index: 0 },
    bitcoin_block: { height: 1, time: 1000 },
    status: 'success' as const,
  };
}

function btcTx(overrides: Partial<BitcoinTransaction>): BitcoinTransaction {
  return {
    txid: 'btc',
    time: 100,
    height: 900,
    vin: [{ owned: false, value: '1000', address: 'ext' }],
    vout: [{ owned: true, value: '900', address: 'mine', n: 0 }],
    ...overrides,
  } as unknown as BitcoinTransaction;
}

const sip10Asset = {
  category: 'fungible',
  protocol: 'sip10',
  chain: 'stacks',
  name: 'Token',
  symbol: 'TOK',
  decimals: 6,
  canTransfer: true,
  assetId: 'SP.token::tok',
  contractId: 'SP.token',
  imageCanonicalUri: '',
  hasMemo: false,
} as unknown as Sip10Asset;

const account = {
  id: { fingerprint: 'fp', accountIndex: 0 },
  stacks: { stxAddress: 'SP1' },
  bitcoin: { type: 'fixedAddress', address: 'bc1qmine' },
} as unknown as AccountAddresses;

describe(BlockchainActivityService.name, () => {
  const mockHiro = {
    getPrincipalTransactions: vi.fn(),
    getPrincipalBalanceChanges: vi.fn(),
  } as unknown as HiroStacksApiClient;
  const mockStacksTx = { getPendingTransactions: vi.fn() } as unknown as StacksTransactionsService;
  const mockBtcTx = { getAccountTransactions: vi.fn() } as unknown as BitcoinTransactionsService;
  const mockMarketData = { getMarketData: vi.fn() } as unknown as MarketDataService;
  const mockSip10 = { getAsset: vi.fn() } as unknown as Sip10AssetService;
  const mockStacksProtocol = {
    getProtocolByAddress: vi.fn(),
    getContractActionType: vi.fn(),
  } as unknown as StacksProtocolService;

  const service = new BlockchainActivityService(
    mockHiro,
    mockStacksTx,
    mockBtcTx,
    mockMarketData,
    mockSip10,
    mockStacksProtocol
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockHiro.getPrincipalTransactions = vi
      .fn()
      .mockResolvedValue({ total: 0, limit: 50, cursor: emptyCursor, results: [] });
    mockHiro.getPrincipalBalanceChanges = vi
      .fn()
      .mockResolvedValue({ total: 0, limit: 50, cursor: emptyCursor, results: [] });
    mockStacksTx.getPendingTransactions = vi.fn().mockResolvedValue([]);
    mockBtcTx.getAccountTransactions = vi.fn().mockResolvedValue([]);
    mockMarketData.getMarketData = vi.fn().mockRejectedValue(new Error('no quote'));
    mockSip10.getAsset = vi.fn().mockResolvedValue(sip10Asset);
    mockStacksProtocol.getProtocolByAddress = vi.fn().mockResolvedValue(null);
  });

  describe('getActivityByAssetId', () => {
    it('returns empty for NFT (sip9) assets without hitting any source', async () => {
      const result = await service.getActivityByAssetId(account, {
        protocol: 'sip9',
        id: 'SP.c::n',
      });
      expect(result).toEqual([]);
      expect(mockBtcTx.getAccountTransactions).not.toHaveBeenCalled();
      expect(mockHiro.getPrincipalTransactions).not.toHaveBeenCalled();
    });

    it('returns all Bitcoin activity with pending above confirmed for native BTC', async () => {
      mockBtcTx.getAccountTransactions = vi
        .fn()
        .mockResolvedValue([
          btcTx({ txid: 'btc-confirmed', height: 900, time: 200 }),
          btcTx({ txid: 'btc-pending', height: undefined, time: undefined }),
        ]);
      const assetId: CryptoAssetId = { protocol: 'nativeBtc', id: 'BTC' };
      const result = await service.getActivityByAssetId(account, assetId);
      expect(result.map(a => a.txid)).toEqual(['btc-pending', 'btc-confirmed']);
      expect(result[0].status).toBe('pending');
    });

    it('keeps only txs with an STX balance change for native STX', async () => {
      mockHiro.getPrincipalTransactions = vi.fn().mockResolvedValue({
        total: 2,
        limit: 50,
        cursor: emptyCursor,
        results: [
          stxResult(
            {
              ...baseTx(),
              tx_id: '0xtransfer',
              type: 'token_transfer',
              token_transfer: { recipient: 'SP2', amount: '100', memo: null },
            },
            { balance_changes: { stx: { sent: '100', received: '0', net: '-100' } } }
          ),
          stxResult({
            ...baseTx(),
            tx_id: '0xcall',
            type: 'contract_call',
            contract_call: { contract_id: 'SP.x', function_name: 'run' },
          }),
        ],
      });
      const result = await service.getActivityByAssetId(account, {
        protocol: 'nativeStx',
        id: 'STX',
      });
      expect(result.map(a => a.txid)).toEqual(['0xtransfer']);
      expect(result[0].action).toBe('send');
    });

    it('keeps only txs touching the requested SIP-10 asset via balance-changes', async () => {
      mockHiro.getPrincipalTransactions = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          stxResult(
            {
              ...baseTx(),
              tx_id: '0xft',
              type: 'contract_call',
              contract_call: { contract_id: 'SP.token', function_name: 'transfer' },
            },
            { affected_balances: { stx: false, ft: true, nft: false } }
          ),
        ],
      });
      mockHiro.getPrincipalBalanceChanges = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          {
            tx_id: '0xft',
            asset: { type: 'ft', identifier: 'SP.token::tok' },
            balance_change: { sent: '0', received: '500', net: '500' },
          },
        ],
      });
      const assetId: CryptoAssetId = { protocol: 'sip10', id: 'SP.token::tok' };
      const result = await service.getActivityByAssetId(account, assetId);
      expect(result).toHaveLength(1);
      expect(result[0].txid).toBe('0xft');
      expect(result[0].balanceChanges[0].asset).toMatchObject({ assetId: 'SP.token::tok' });
    });

    it('skips classification for txs whose affected_balances rule the asset out', async () => {
      mockHiro.getPrincipalTransactions = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          stxResult(
            {
              ...baseTx(),
              tx_id: '0xnostx',
              type: 'contract_call',
              contract_call: { contract_id: 'SP.dex', function_name: 'swap' },
            },
            { affected_balances: { stx: false, ft: true, nft: false } }
          ),
        ],
      });
      const result = await service.getActivityByAssetId(account, {
        protocol: 'nativeStx',
        id: 'STX',
      });
      expect(result).toEqual([]);
      expect(mockStacksProtocol.getProtocolByAddress).not.toHaveBeenCalled();
      expect(mockHiro.getPrincipalBalanceChanges).not.toHaveBeenCalled();
    });

    it('propagates cancellation instead of degrading ft changes to null', async () => {
      const controller = new AbortController();
      controller.abort();
      mockHiro.getPrincipalTransactions = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          stxResult(
            {
              ...baseTx(),
              tx_id: '0xft',
              type: 'contract_call',
              contract_call: { contract_id: 'SP.token', function_name: 'transfer' },
            },
            { affected_balances: { stx: false, ft: true, nft: false } }
          ),
        ],
      });
      mockHiro.getPrincipalBalanceChanges = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          {
            tx_id: '0xft',
            asset: { type: 'ft', identifier: 'SP.token::tok' },
            balance_change: { sent: '0', received: '500', net: '500' },
          },
        ],
      });
      mockSip10.getAsset = vi.fn().mockRejectedValue(new Error('aborted'));
      await expect(
        service.getActivityByAssetId(
          account,
          { protocol: 'sip10', id: 'SP.token::tok' },
          controller.signal
        )
      ).rejects.toThrow();
    });

    it('reclassifies an unmapped SIP-10 transfer contract call as receive', async () => {
      mockHiro.getPrincipalTransactions = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          stxResult(
            {
              ...baseTx(),
              tx_id: '0xft',
              type: 'contract_call',
              contract_call: { contract_id: 'SP.token', function_name: 'transfer' },
            },
            { involvement: 'affected', affected_balances: { stx: false, ft: true, nft: false } }
          ),
        ],
      });
      mockHiro.getPrincipalBalanceChanges = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          {
            tx_id: '0xft',
            asset: { type: 'ft', identifier: 'SP.token::tok' },
            balance_change: { sent: '0', received: '500', net: '500' },
          },
        ],
      });
      const result = await service.getActivityByAssetId(account, {
        protocol: 'sip10',
        id: 'SP.token::tok',
      });
      expect(result[0].action).toBe('receive');
      expect(result[0].contract).toEqual({
        type: 'call',
        contractId: 'SP.token',
        functionName: 'transfer',
      });
    });
  });

  describe('getActivity', () => {
    it('stitches pending above confirmed on the first page and dedups a tx present in both', async () => {
      mockHiro.getPrincipalTransactions = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          stxResult(
            {
              ...baseTx(),
              tx_id: '0xdup',
              type: 'token_transfer',
              token_transfer: { recipient: 'SP2', amount: '1000', memo: null },
            },
            { balance_changes: { stx: { sent: '1000', received: '0', net: '-1000' } } }
          ),
        ],
      });
      mockStacksTx.getPendingTransactions = vi.fn().mockResolvedValue([
        {
          tx_id: '0xdup',
          tx_type: 'token_transfer',
          sender_address: 'SP1',
          sponsored: false,
          fee_rate: '100',
          receipt_time: 2000,
          token_transfer: { recipient_address: 'SP2', amount: '1000', memo: '' },
        },
        {
          tx_id: '0xmempoolonly',
          tx_type: 'token_transfer',
          sender_address: 'SP1',
          sponsored: false,
          fee_rate: '100',
          receipt_time: 2001,
          token_transfer: { recipient_address: 'SP3', amount: '500', memo: '' },
        },
      ]);
      const response = await service.getActivity({ account });
      expect(response.items.map(item => item.txid)).toEqual(['0xmempoolonly', '0xdup']);
      expect(response.items[0].status).toBe('pending');
      expect(response.items[1].status).toBe('success');
      expect(response.nextCursor).toBeNull();
      expect(response.hasMore).toBe(false);
    });

    it('emits an unconfirmed BTC tx that carries a time only as pending, never in the merge', async () => {
      mockBtcTx.getAccountTransactions = vi
        .fn()
        .mockResolvedValue([btcTx({ txid: 'btc-inflight', height: undefined, time: 500 })]);
      const response = await service.getActivity({ account });
      const inflight = response.items.filter(item => item.txid === 'btc-inflight');
      expect(inflight).toHaveLength(1);
      expect(inflight[0].status).toBe('pending');
      expect(response.nextCursor).toBeNull();
    });

    it('fills a full page of activities when non-activity txs (coinbase) are interleaved', async () => {
      const results = Array.from({ length: 8 }, (_, i) =>
        i % 2 === 0
          ? stxResult(
              {
                ...baseTx(),
                tx_id: `0xtransfer-${i}`,
                block: { ...baseTx().block, time: 1000 - i },
                type: 'token_transfer',
                token_transfer: { recipient: 'SP2', amount: '100', memo: null },
              },
              { balance_changes: { stx: { sent: '100', received: '0', net: '-100' } } }
            )
          : stxResult({
              ...baseTx(),
              tx_id: `0xcoinbase-${i}`,
              block: { ...baseTx().block, time: 1000 - i },
              type: 'coinbase',
              coinbase: { alt_recipient: null },
            })
      );
      mockHiro.getPrincipalTransactions = vi
        .fn()
        .mockResolvedValue({ total: 8, limit: 50, cursor: emptyCursor, results });

      const response = await service.getActivity({ account, limit: 3 });

      expect(response.items).toHaveLength(3);
      expect(response.items.every(item => item.action === 'send')).toBe(true);
      expect(response.nextCursor).not.toBeNull();
      expect(response.hasMore).toBe(true);
    });
  });

  describe('STX fee handling', () => {
    async function nativeStxActivity() {
      return service.getActivityByAssetId(account, { protocol: 'nativeStx', id: 'STX' });
    }

    it('drops the fee-only phantom STX change on a non-STX contract call', async () => {
      mockHiro.getPrincipalTransactions = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          stxResult(
            {
              ...baseTx(),
              tx_id: '0xfeeonly',
              fee_rate: '100',
              type: 'contract_call',
              contract_call: { contract_id: 'SP.dex', function_name: 'swap' },
            },
            {
              balance_changes: { stx: { sent: '100', received: '0', net: '-100' } },
              affected_balances: { stx: true, ft: false, nft: false },
            }
          ),
        ],
      });
      expect(await nativeStxActivity()).toEqual([]);
    });

    it('nets the fee out of a STX-moving contract call', async () => {
      mockHiro.getPrincipalTransactions = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          stxResult(
            {
              ...baseTx(),
              tx_id: '0xstxswap',
              fee_rate: '100',
              type: 'contract_call',
              contract_call: { contract_id: 'SP.dex', function_name: 'swap' },
            },
            { balance_changes: { stx: { sent: '1100', received: '0', net: '-1100' } } }
          ),
        ],
      });
      const result = await nativeStxActivity();
      expect(result).toHaveLength(1);
      expect(result[0].balanceChanges[0].direction).toBe('sent');
      expect(result[0].balanceChanges[0].amount.crypto.amount.toString()).toBe('1000');
    });

    it('does not add the fee back on a sponsored tx (the sponsor pays it)', async () => {
      mockHiro.getPrincipalTransactions = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          stxResult(
            {
              ...baseTx(),
              tx_id: '0xsponsored',
              fee_rate: '100',
              type: 'contract_call',
              sponsor: { address: 'SPSPONSOR', nonce: 0 },
              contract_call: { contract_id: 'SP.dex', function_name: 'swap' },
            },
            { balance_changes: { stx: { sent: '0', received: '0', net: '0' } } }
          ),
        ],
      });
      expect(await nativeStxActivity()).toEqual([]);
    });

    it('attaches no fee to a confirmed sponsored tx the user initiated', async () => {
      mockHiro.getPrincipalTransactions = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          stxResult(
            {
              ...baseTx(),
              tx_id: '0xsponsoredmove',
              fee_rate: '100',
              type: 'contract_call',
              sponsor: { address: 'SPSPONSOR', nonce: 0 },
              contract_call: { contract_id: 'SP.dex', function_name: 'swap' },
            },
            { balance_changes: { stx: { sent: '500', received: '0', net: '-500' } } }
          ),
        ],
      });
      const result = await nativeStxActivity();
      expect(result).toHaveLength(1);
      expect(result[0].fee).toBeUndefined();
      expect(result[0].balanceChanges[0].amount.crypto.amount.toString()).toBe('500');
    });

    it('attaches no fee to a pending sponsored tx the user initiated', async () => {
      mockStacksTx.getPendingTransactions = vi.fn().mockResolvedValue([
        {
          tx_id: '0xpendingsponsored',
          tx_type: 'token_transfer',
          sender_address: 'SP1',
          sponsored: true,
          fee_rate: '100',
          receipt_time: 2000,
          token_transfer: { recipient_address: 'SP2', amount: '1000', memo: '' },
        },
      ]);
      const result = await nativeStxActivity();
      expect(result).toHaveLength(1);
      expect(result[0].txid).toBe('0xpendingsponsored');
      expect(result[0].fee).toBeUndefined();
    });

    it('shows the transfer amount, not amount+fee, on a confirmed send', async () => {
      mockHiro.getPrincipalTransactions = vi.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          stxResult(
            {
              ...baseTx(),
              tx_id: '0xsend',
              fee_rate: '100',
              type: 'token_transfer',
              token_transfer: { recipient: 'SP2', amount: '1000', memo: null },
            },
            { balance_changes: { stx: { sent: '1100', received: '0', net: '-1100' } } }
          ),
        ],
      });
      const result = await nativeStxActivity();
      expect(result[0].balanceChanges[0].amount.crypto.amount.toString()).toBe('1000');
      expect(result[0].fee?.amount.toString()).toBe('100');
    });
  });
});
