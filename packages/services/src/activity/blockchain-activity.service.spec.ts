import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  AccountAddresses,
  BitcoinTransaction,
  CryptoAssetId,
  Sip10Asset,
} from '@leather.io/models';

import { Sip9AssetService } from '../assets/sip9-asset.service';
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
    fee_rate: '100',
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
  const mockSip9 = {} as unknown as Sip9AssetService;
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
    mockSip9,
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
});
