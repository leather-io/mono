import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  AccountAddresses,
  BitcoinTransaction,
  CryptoAssetId,
  Sip10Asset,
} from '@leather.io/models';

import { type Sip10AssetService } from '../assets/sip10-asset.service';
import { type HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import type {
  HiroPrincipalTransaction,
  HiroPrincipalTransactionsResultItem,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import { type MarketDataService } from '../market/market-data.service';
import { type StacksProtocolService } from '../protocols/stacks-protocol.service';
import { createMock } from '../test/create-mock';
import { type BitcoinTransactionsService } from '../transactions/bitcoin-transactions.service';
import { type StacksTransactionsService } from '../transactions/stacks-transactions.service';
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
    vin: [{ owned: false, value: '1000', address: 'ext', n: 0 }],
    vout: [{ owned: true, value: '900', address: 'mine', n: 0 }],
    ...overrides,
  };
}

const sip10Asset: Sip10Asset = {
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
};

const account: AccountAddresses = {
  id: { fingerprint: 'fp', accountIndex: 0 },
  stacks: { stxAddress: 'SP1' },
  bitcoin: { type: 'fixedAddress', address: 'bc1qmine', paymentType: 'p2wpkh' },
};

describe(BlockchainActivityService.name, () => {
  const getPrincipalTransactions = vi.fn();
  const getPrincipalBalanceChanges = vi.fn();
  const getPendingTransactions = vi.fn();
  const getTransactionById = vi.fn();
  const getAccountTransactions = vi.fn();
  const getTransactionByTxId = vi.fn();
  const getMarketData = vi.fn();
  const getAsset = vi.fn();
  const getProtocolByAddress = vi.fn();
  const getContractActionType = vi.fn();
  const mockHiro = createMock<HiroStacksApiClient>({
    getPrincipalTransactions,
    getPrincipalBalanceChanges,
  });
  const mockStacksTx = createMock<StacksTransactionsService>({
    getPendingTransactions,
    getTransactionById,
  });
  const mockBtcTx = createMock<BitcoinTransactionsService>({
    getAccountTransactions,
    getTransactionByTxId,
  });
  const mockMarketData = createMock<MarketDataService>({ getMarketData });
  const mockSip10 = createMock<Sip10AssetService>({ getAsset });
  const mockStacksProtocol = createMock<StacksProtocolService>({
    getProtocolByAddress,
    getContractActionType,
  });

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
    getPrincipalTransactions
      .mockReset()
      .mockResolvedValue({ total: 0, limit: 50, cursor: emptyCursor, results: [] });
    getPrincipalBalanceChanges
      .mockReset()
      .mockResolvedValue({ total: 0, limit: 50, cursor: emptyCursor, results: [] });
    getPendingTransactions.mockReset().mockResolvedValue([]);
    getAccountTransactions.mockReset().mockResolvedValue([]);
    getMarketData.mockReset().mockRejectedValue(new Error('no quote'));
    getAsset.mockReset().mockResolvedValue(sip10Asset);
    getProtocolByAddress.mockReset().mockResolvedValue(null);
    getTransactionByTxId.mockReset().mockResolvedValue(null);
    getTransactionById.mockReset().mockResolvedValue(null);
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
      getAccountTransactions.mockResolvedValue([
        btcTx({ txid: 'btc-confirmed', height: 900, time: 200 }),
        btcTx({ txid: 'btc-pending', height: undefined, time: undefined }),
      ]);
      const assetId: CryptoAssetId = { protocol: 'nativeBtc', id: 'BTC' };
      const result = await service.getActivityByAssetId(account, assetId);
      expect(result.map(a => a.txid)).toEqual(['btc-pending', 'btc-confirmed']);
      expect(result[0].status).toBe('pending');
    });

    it('keeps only txs with an STX balance change for native STX', async () => {
      getPrincipalTransactions.mockResolvedValue({
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
      getPrincipalTransactions.mockResolvedValue({
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
      getPrincipalBalanceChanges.mockResolvedValue({
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
      getPrincipalTransactions.mockResolvedValue({
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
      getPrincipalTransactions.mockResolvedValue({
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
      getPrincipalBalanceChanges.mockResolvedValue({
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
      getAsset.mockRejectedValue(new Error('aborted'));
      await expect(
        service.getActivityByAssetId(
          account,
          { protocol: 'sip10', id: 'SP.token::tok' },
          controller.signal
        )
      ).rejects.toThrow();
    });

    it('emits a tx present in both the mempool and the confirmed scan exactly once', async () => {
      getPrincipalTransactions.mockResolvedValue({
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
      getPendingTransactions.mockResolvedValue([
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
      const result = await service.getActivityByAssetId(account, {
        protocol: 'nativeStx',
        id: 'STX',
      });
      expect(result.map(a => a.txid)).toEqual(['0xmempoolonly', '0xdup']);
      expect(result[0].status).toBe('pending');
      expect(result[1].status).toBe('success');
    });

    it('reclassifies an unmapped SIP-10 transfer contract call as receive', async () => {
      getPrincipalTransactions.mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          stxResult(
            {
              ...baseTx(),
              tx_id: '0xft',
              sender: { address: 'SP2', nonce: 0 },
              type: 'contract_call',
              contract_call: { contract_id: 'SP.token', function_name: 'transfer' },
            },
            { involvement: 'affected', affected_balances: { stx: false, ft: true, nft: false } }
          ),
        ],
      });
      getPrincipalBalanceChanges.mockResolvedValue({
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
      expect(result[0].counterparty).toBe('SP2');
      expect(result[0].contract).toEqual({
        type: 'call',
        contractId: 'SP.token',
        functionName: 'transfer',
      });
    });
  });

  describe('getActivity', () => {
    it('stitches pending above confirmed on the first page and dedups a tx present in both', async () => {
      getPrincipalTransactions.mockResolvedValue({
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
      getPendingTransactions.mockResolvedValue([
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
      getAccountTransactions.mockResolvedValue([
        btcTx({ txid: 'btc-inflight', height: undefined, time: 500 }),
      ]);
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
      getPrincipalTransactions.mockResolvedValue({
        total: 8,
        limit: 50,
        cursor: emptyCursor,
        results,
      });

      const response = await service.getActivity({ account, limit: 3 });

      expect(response.items).toHaveLength(3);
      expect(response.items.every(item => item.action === 'send')).toBe(true);
      expect(response.nextCursor).not.toBeNull();
      expect(response.hasMore).toBe(true);
    });

    function unownedBtcTx(txid: string, time: number) {
      return btcTx({
        txid,
        time,
        height: 900,
        vin: [{ owned: false, value: '1000', address: 'ext', n: 0 }],
        vout: [{ owned: false, value: '900', address: 'other', n: 0 }],
      });
    }

    it('advances past a page whose items all map to null instead of dead-ending', async () => {
      getAccountTransactions.mockResolvedValue([
        unownedBtcTx('btc-unowned-1', 1000),
        unownedBtcTx('btc-unowned-2', 999),
        btcTx({ txid: 'btc-owned-1', time: 500 }),
        btcTx({ txid: 'btc-owned-2', time: 400 }),
      ]);

      const response = await service.getActivity({ account, limit: 2 });

      expect(response.items.map(item => item.txid)).toEqual(['btc-owned-1', 'btc-owned-2']);
      expect(response.nextCursor).toBeNull();
      expect(response.hasMore).toBe(false);
    });

    it('stops advancing at the fetch cap when every page maps to zero activities', async () => {
      getAccountTransactions.mockResolvedValue(
        Array.from({ length: 12 }, (_, i) => unownedBtcTx(`btc-unowned-${i}`, 1000 - i))
      );

      const response = await service.getActivity({ account, limit: 2 });

      expect(response.items).toEqual([]);
      expect(response.hasMore).toBe(true);
      expect(response.nextCursor).not.toBeNull();
    });
  });

  describe('STX fee handling', () => {
    async function nativeStxActivity() {
      return service.getActivityByAssetId(account, { protocol: 'nativeStx', id: 'STX' });
    }

    it('drops the fee-only phantom STX change on a non-STX contract call', async () => {
      getPrincipalTransactions.mockResolvedValue({
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
      getPrincipalTransactions.mockResolvedValue({
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
      getPrincipalTransactions.mockResolvedValue({
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
      getPrincipalTransactions.mockResolvedValue({
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
      getPendingTransactions.mockResolvedValue([
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
      getPrincipalTransactions.mockResolvedValue({
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

  describe('getActivityByTxId', () => {
    const btcAccount: AccountAddresses = {
      id: { fingerprint: 'fp', accountIndex: 0 },
      bitcoin: { type: 'fixedAddress', address: 'bc1qmine', paymentType: 'p2wpkh' },
    };
    const stxAccount: AccountAddresses = {
      id: { fingerprint: 'fp', accountIndex: 0 },
      stacks: { stxAddress: 'SP1' },
    };

    it('marks bitcoin ownership by the account address, not the fetched owned flags', async () => {
      getTransactionByTxId.mockResolvedValue(
        btcTx({
          txid: 'btc-rx',
          vin: [{ owned: true, value: '1000', address: 'ext', n: 0 }],
          vout: [{ owned: false, value: '900', address: 'bc1qmine', n: 0 }],
        })
      );
      const result = await service.getActivityByTxId(btcAccount, 'btc-rx');
      expect(result?.chain).toBe('bitcoin');
      expect(result?.action).toBe('receive');
      expect(result?.txid).toBe('btc-rx');
    });

    it('maps an stx receive without a balance-changes call', async () => {
      getTransactionById.mockResolvedValue({
        tx_id: '0xrx',
        sender: { address: 'SP2', nonce: 1 },
        sponsor: null,
        fee_rate: '100',
        block: { height: 5, hash: '0x', index_hash: '0x', time: 1000, tx_index: 0 },
        bitcoin_block: { height: 800_000, time: 1000 },
        status: 'success',
        parent_block: { hash: '0x', index_hash: '0x' },
        event_count: 1,
        execution_cost: {
          read_count: 0,
          read_length: 0,
          runtime: 0,
          write_count: 0,
          write_length: 0,
        },
        vm_error: null,
        type: 'token_transfer',
        token_transfer: { recipient: 'SP1', amount: '5000', memo: null },
      });
      const result = await service.getActivityByTxId(stxAccount, '0xrx');
      expect(result?.action).toBe('receive');
      expect(result?.counterparty).toBe('SP2');
      expect(result?.balanceChanges[0].amount.crypto.amount.toString()).toBe('5000');
      expect(mockHiro.getPrincipalBalanceChanges).not.toHaveBeenCalled();
    });

    it('fetches balance changes for a contract call and reclassifies a received sip10 transfer', async () => {
      getTransactionById.mockResolvedValue({
        tx_id: '0xcall',
        sender: { address: 'SP2', nonce: 1 },
        sponsor: null,
        fee_rate: '100',
        block: { height: 5, hash: '0x', index_hash: '0x', time: 1000, tx_index: 0 },
        bitcoin_block: { height: 800_000, time: 1000 },
        status: 'success',
        parent_block: { hash: '0x', index_hash: '0x' },
        event_count: 1,
        execution_cost: {
          read_count: 0,
          read_length: 0,
          runtime: 0,
          write_count: 0,
          write_length: 0,
        },
        vm_error: null,
        type: 'contract_call',
        contract_call: { contract_id: 'SP.token', function_name: 'transfer' },
      });
      getPrincipalBalanceChanges.mockResolvedValue({
        total: 1,
        limit: 50,
        cursor: emptyCursor,
        results: [
          {
            tx_id: '0xcall',
            asset: { type: 'ft', identifier: 'SP.token::tok' },
            balance_change: { sent: '0', received: '500', net: '500' },
          },
        ],
      });
      const result = await service.getActivityByTxId(stxAccount, '0xcall');
      expect(mockHiro.getPrincipalBalanceChanges).toHaveBeenCalled();
      expect(result?.action).toBe('receive');
      expect(result?.counterparty).toBe('SP2');
      expect(result?.balanceChanges.some(change => change.asset.category === 'fungible')).toBe(
        true
      );
    });

    it('returns null when the transaction is not found', async () => {
      const result = await service.getActivityByTxId(stxAccount, '0xmissing');
      expect(result).toBeNull();
    });
  });
});
