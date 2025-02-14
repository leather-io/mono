import { Utxo, UtxoId } from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import {
  filterMatchesAnyUtxoId,
  filterOutMatchesAnyUtxoId,
  getUtxoIdFromOutpoint,
  getUtxoIdFromSatpoint,
  isInboundUtxo,
  isUneconomicalUtxo,
  selectUniqueUtxoIds,
  sumUtxoValues,
  uneconomicalSatThreshold,
  utxoToId,
} from './utxos.utils';

describe('getUtxoIdFromSatPoint', () => {
  it('splits a valid satpoint and produces a corresponding utxo id', () => {
    const txid = 'abcdef12345';
    const vout = '0';
    const offset = '0';
    const satpoint = `${txid}:${vout}:${offset}`;
    const utxoId = getUtxoIdFromSatpoint(satpoint);
    expect(utxoId?.txid).toEqual(txid);
    expect(utxoId?.vout).toEqual(Number(vout));
  });

  it('returns undefined for invalid satpoints', () => {
    expect(getUtxoIdFromSatpoint('abcdef12345:0')).toEqual(undefined);
    expect(getUtxoIdFromSatpoint('abcdef:abcdef')).toEqual(undefined);
    expect(getUtxoIdFromSatpoint('')).toEqual(undefined);
    expect(getUtxoIdFromSatpoint(null!)).toEqual(undefined);
    expect(getUtxoIdFromSatpoint(undefined!)).toEqual(undefined);
  });
});

describe('getUtxoIdFromOutpoint', () => {
  it('splits a valid outpoint and produces a corresponding utxo id', () => {
    const txid = 'abcdef12345';
    const vout = '0';
    const outpoint = `${txid}:${vout}`;
    const utxoId = getUtxoIdFromOutpoint(outpoint);
    expect(utxoId?.txid).toEqual(txid);
    expect(utxoId?.vout).toEqual(Number(vout));
  });

  it('returns undefined for invalid outpoints', () => {
    expect(getUtxoIdFromOutpoint('abcdef12345')).toEqual(undefined);
    expect(getUtxoIdFromOutpoint('abcdef:abcdef')).toEqual(undefined);
    expect(getUtxoIdFromOutpoint('')).toEqual(undefined);
    expect(getUtxoIdFromOutpoint(null!)).toEqual(undefined);
    expect(getUtxoIdFromOutpoint(undefined!)).toEqual(undefined);
  });
});

describe('utxo list filtering', () => {
  const utxos = [
    {
      txid: '1234',
      vout: 0,
      value: '100000',
    },
    {
      txid: '2468',
      vout: 1,
      value: '100000',
    },
    {
      txid: '3692',
      vout: 2,
      value: '100000',
    },
    {
      txid: '4826',
      vout: 3,
      value: '100000',
    },
  ] as Utxo[];

  const ids = [
    {
      txid: '1234',
      vout: 4,
    },
    {
      txid: '2468',
      vout: 1,
    },
    {
      txid: '4826',
      vout: 3,
    },
    {
      txid: '5050',
      vout: 5,
    },
  ] as UtxoId[];

  describe('filterMatchesAnyUtxoId', () => {
    it('filters for matching utxos against list of utxo ids', () => {
      const filteredUtxos = utxos.filter(filterMatchesAnyUtxoId(ids));
      expect(filteredUtxos).toEqual([
        {
          txid: '2468',
          vout: 1,
          value: '100000',
        },
        {
          txid: '4826',
          vout: 3,
          value: '100000',
        },
      ]);
    });
    it('handles empty id lists', () => {
      const filteredUtxos = utxos.filter(filterMatchesAnyUtxoId([]));
      expect(filteredUtxos).toEqual([]);
    });
  });
  describe('filterOutMatchesAnyUtxoId', () => {
    it('filters out matching utxos against list of utxo ids', () => {
      const filteredUtxos = utxos.filter(filterOutMatchesAnyUtxoId(ids));
      expect(filteredUtxos).toEqual([
        {
          txid: '1234',
          vout: 0,
          value: '100000',
        },
        {
          txid: '3692',
          vout: 2,
          value: '100000',
        },
      ]);
    });
    it('handles empty id lists', () => {
      const filteredUtxos = utxos.filter(filterOutMatchesAnyUtxoId([]));
      expect(filteredUtxos.length).toEqual(4);
    });
  });
});

describe('isInboundUtxo', () => {
  const utxos = [
    {
      txid: '1234',
      vout: 0,
      value: '100000',
      height: 1234,
    },
    {
      txid: '2468',
      vout: 1,
      value: '100000',
    },
    {
      txid: '3692',
      vout: 2,
      value: '100000',
      height: 2468,
    },
    {
      txid: '4826',
      vout: 3,
      value: '100000',
    },
  ] as Utxo[];

  it('should filter confirmed tx with a block height value', () => {
    const inboundUtxos = utxos.filter(isInboundUtxo);
    expect(inboundUtxos).toEqual([
      {
        txid: '2468',
        vout: 1,
        value: '100000',
      },
      {
        txid: '4826',
        vout: 3,
        value: '100000',
      },
    ]);
  });
});

describe('utxoToId', () => {
  it('returns the id of a UTXO', () => {
    const txid = 'txid';
    const vout = 2;
    const utxoId = { txid, vout };
    const utxo = {
      ...utxoId,
      value: 50000,
    } as unknown as Utxo;
    expect(utxoToId(utxo)).toEqual(utxoId);
  });
});

describe('isUneconomicalUtxo', () => {
  it('returns a boolean reflecting whether utxo value is less than uneconomical sat threshold', () => {
    const uneconomicalUtxo = {
      value: uneconomicalSatThreshold - 1,
    } as unknown as Utxo;
    const economicalUtxo = {
      value: uneconomicalSatThreshold + 1,
    } as unknown as Utxo;
    expect(isUneconomicalUtxo(uneconomicalUtxo)).toEqual(true);
    expect(isUneconomicalUtxo(economicalUtxo)).toEqual(false);
  });
});

describe('sumUtxoValues', () => {
  it('returns summed values of all utxo in list', () => {
    const utxos = [
      {
        value: '10000',
      },
      {
        value: '20000',
      },
      {
        value: '30000',
      },
      {
        value: '40000',
      },
    ] as Utxo[];
    expect(sumUtxoValues(utxos)).toEqual(initBigNumber('100000'));
  });
});

describe('selectUniqueUtxoIds', () => {
  const utxos = [
    {
      txid: '1234',
      vout: 0,
      value: '100000',
    },
    {
      txid: '1234',
      vout: 0,
      value: '200000',
    },
    {
      txid: '1234',
      vout: 1,
      value: '100000',
    },
    {
      txid: '5678',
      vout: 0,
      value: '100000',
    },
    {
      txid: '5678',
      vout: 0,
      value: '300000',
    },
  ] as Utxo[];

  it('removes duplicate UTXOs, keeping first occurrence', () => {
    expect(selectUniqueUtxoIds(utxos)).toEqual([
      {
        txid: '1234',
        vout: 0,
        value: '100000',
      },
      {
        txid: '1234',
        vout: 1,
        value: '100000',
      },
      {
        txid: '5678',
        vout: 0,
        value: '100000',
      },
    ]);
  });

  it('removes duplicate UTXO IDs', () => {
    const utxos: UtxoId[] = [
      {
        txid: '1234',
        vout: 0,
      },
      {
        txid: '1234',
        vout: 0,
      },
      {
        txid: '1234',
        vout: 1,
      },
      {
        txid: '5678',
        vout: 0,
      },
      {
        txid: '5678',
        vout: 0,
      },
    ];
    expect(selectUniqueUtxoIds(utxos)).toEqual([
      {
        txid: '1234',
        vout: 0,
      },
      {
        txid: '1234',
        vout: 1,
      },
      {
        txid: '5678',
        vout: 0,
      },
    ]);
  });
});
