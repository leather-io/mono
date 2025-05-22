import { Utxo, UtxoId } from '@leather.io/models';
import { initBigNumber } from '@leather.io/utils';

import { LeatherApiBitcoinTransaction } from '../infrastructure/api/leather/leather-api.client';
import {
  fallbackUtxoHeight,
  filterMatchesAnyUtxoId,
  filterOutMatchesAnyUtxoId,
  getOutboundUtxos,
  getUtxoIdFromOutpoint,
  getUtxoIdFromSatpoint,
  isPrimaryReceiveAddressUtxo,
  isUnconfirmedUtxo,
  isUneconomicalUtxo,
  selectUniqueUtxoIds,
  sumUtxoValues,
  uneconomicalSatThreshold,
  utxoToId,
} from './utxos.utils';

describe(getUtxoIdFromSatpoint.name, () => {
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

describe(getUtxoIdFromOutpoint.name, () => {
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

  describe(filterMatchesAnyUtxoId.name, () => {
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

  describe(filterOutMatchesAnyUtxoId.name, () => {
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

describe(isUnconfirmedUtxo.name, () => {
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
    const unconfirmedUtxos = utxos.filter(isUnconfirmedUtxo);
    expect(unconfirmedUtxos).toEqual([
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

describe(utxoToId.name, () => {
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

describe(isUneconomicalUtxo.name, () => {
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

describe(sumUtxoValues.name, () => {
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

describe(selectUniqueUtxoIds.name, () => {
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

describe(getOutboundUtxos.name, () => {
  const ORIGINAL_TX_HEIGHT = 100_000;
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
  const txs: LeatherApiBitcoinTransaction[] = [
    {
      txid: '1',
      vin: [ownedVin],
      vout: [],
    },
    {
      txid: '2',
      vin: [externalVin],
      vout: [],
    },
    {
      txid: '3',
      height: ORIGINAL_TX_HEIGHT,
      vin: [],
      vout: [ownedVout],
    },
    {
      txid: '4',
      height: 60000, // confirmed
      vin: [],
      vout: [],
    },
  ];

  it('maps owned vins of unconfirmed, outbound transactions to UTXOs', () => {
    const outboundUtxos = getOutboundUtxos(txs);

    expect(outboundUtxos.length).toEqual(1);
    expect(outboundUtxos[0].txid).toEqual(ownedVin.txid);
    expect(outboundUtxos[0].vout).toEqual(ownedVin.n);
    expect(outboundUtxos[0].address).toEqual(ownedVin.address);
    expect(outboundUtxos[0].path).toEqual(ownedVin.path);
    expect(outboundUtxos[0].value).toEqual(ownedVin.value);
  });

  it('reads the original tx height if available, otherwise falls back to a default', () => {
    const originalHeightUtxos = getOutboundUtxos(txs);
    const defaultHeightUtxos = getOutboundUtxos(txs.slice(0, 1));

    expect(originalHeightUtxos[0].height).toEqual(ORIGINAL_TX_HEIGHT);
    expect(defaultHeightUtxos[0].height).toEqual(fallbackUtxoHeight);
  });
});

describe(isPrimaryReceiveAddressUtxo.name, () => {
  it('returns true for primary receive address UTXOs', () => {
    const nsUtxo = {
      path: `m/84'/0'/0'/0/0`,
    } as unknown as Utxo;
    const trUtxo = {
      path: `m/86'/0'/1'/0/0`,
    } as unknown as Utxo;
    expect(isPrimaryReceiveAddressUtxo(nsUtxo)).toEqual(true);
    expect(isPrimaryReceiveAddressUtxo(trUtxo)).toEqual(true);
  });

  it('returns false for non-primary receive address UTXOs', () => {
    const changeAddressUtxo = {
      path: `m/84'/0'/0'/1/0`,
    } as unknown as Utxo;
    const nonPrimaryAddressUtxo = {
      path: `m/84'/0'/0'/0/1`,
    } as unknown as Utxo;
    expect(isPrimaryReceiveAddressUtxo(changeAddressUtxo)).toEqual(false);
    expect(isPrimaryReceiveAddressUtxo(nonPrimaryAddressUtxo)).toEqual(false);
  });

  it('returns true for missing or invalid derivation paths', () => {
    const missingPathUtxo = {} as unknown as Utxo;
    const invalidPathUtxo = {
      path: 'invalid-path',
    } as unknown as Utxo;
    expect(isPrimaryReceiveAddressUtxo(missingPathUtxo)).toEqual(true);
    expect(isPrimaryReceiveAddressUtxo(invalidPathUtxo)).toEqual(true);
  });
});
