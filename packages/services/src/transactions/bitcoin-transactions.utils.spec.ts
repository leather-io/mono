import { LeatherApiBitcoinTransaction } from '../infrastructure/api/leather/leather-api.client';
import {
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
