import { LeatherApiBitcoinTransaction } from '../infrastructure/api/leather/leather-api.client';
import type { MempoolTransaction } from '../infrastructure/api/mempool/mempool-api.schema';
import {
  createBitcoinTransactionFromMempool,
  isOutboundTx,
  isPendingTx,
  readTxOwnedVins,
  readTxOwnedVouts,
} from './bitcoin-transactions.utils';

const ownedVin = {
  txid: '3',
  n: 0,
  value: '10000',
  address: 'bc1q123',
  owned: true,
  path: 'bc1q123-path',
};
const externalVin = {
  txid: '2',
  n: 1,
  value: '20000',
  address: 'bc1q246',
  path: 'bc1q246-path',
};
const ownedVout = {
  n: 0,
  value: '30000',
  address: 'bc1q369',
  owned: true,
  path: 'bc1q369-path',
};
const externalVout = {
  n: 1,
  value: '40000',
  address: 'bc1q246',
  path: 'bc1q246-path',
};

const mockTx: LeatherApiBitcoinTransaction = {
  txid: '5',
  vin: [ownedVin, externalVin],
  vout: [ownedVout, externalVout],
  height: 800_000,
};

describe(isPendingTx.name, () => {
  it('should consider txs without height as pending', () => {
    const txNoHeight = { ...mockTx };
    delete txNoHeight.height;
    expect(isPendingTx(txNoHeight)).toBe(true);
    expect(isPendingTx(mockTx)).toBe(false);
  });
});

describe(isOutboundTx.name, () => {
  it('should identify txs with owned vins as outbound', () => {
    const txNoOwnedVins = { ...mockTx, vin: [externalVin] };
    expect(isOutboundTx(txNoOwnedVins)).toBe(false);
    expect(isOutboundTx(mockTx)).toBe(true);
  });
});

describe(readTxOwnedVins.name, () => {
  it('should return any owned vins in tx', () => {
    const ownedVins = readTxOwnedVins(mockTx);
    expect(ownedVins.length).toBe(1);
    expect(ownedVins[0]).toBe(ownedVin);
  });
});

describe(readTxOwnedVouts.name, () => {
  it('should return any owned vouts in tx', () => {
    const ownedVouts = readTxOwnedVouts(mockTx);
    expect(ownedVouts.length).toBe(1);
    expect(ownedVouts[0]).toBe(ownedVout);
  });
});

const vaultAddress = 'bcrt1qvault';
const lockAddress = 'bcrt1qlock';

const mempoolReceiveTx: MempoolTransaction = {
  txid: '6',
  status: { confirmed: true, block_height: 4471, block_hash: 'abc', block_time: 1_700_000_000 },
  fees: 153,
  vin: [{ txid: '5', vout: 0, prevout: { scriptpubkey_address: lockAddress, value: 10_000_000 } }],
  vout: [{ scriptpubkey_address: vaultAddress, value: 9_999_847 }],
};

describe(createBitcoinTransactionFromMempool.name, () => {
  it('should mark the queried address as owned for a fixed-address account', () => {
    const tx = createBitcoinTransactionFromMempool({
      ...mempoolReceiveTx,
      address: vaultAddress,
    });
    expect(tx.vout[0]?.owned).toBe(true);
    expect(tx.vin[0]?.owned).toBeUndefined();
  });

  it('should own nothing when no address is supplied', () => {
    const tx = createBitcoinTransactionFromMempool(mempoolReceiveTx);
    expect(tx.vout[0]?.owned).toBeUndefined();
    expect(tx.vin[0]?.owned).toBeUndefined();
  });

  it('should not treat an addressless output as owned', () => {
    const tx = createBitcoinTransactionFromMempool({
      ...mempoolReceiveTx,
      vout: [{ scriptpubkey_address: undefined, value: 0 }],
    });
    expect(tx.vout[0]?.owned).toBeUndefined();
  });

  it('should omit path when the account has no derivation path', () => {
    const tx = createBitcoinTransactionFromMempool({
      ...mempoolReceiveTx,
      address: vaultAddress,
    });
    expect(tx.vout[0]?.path).toBeUndefined();
  });
});
