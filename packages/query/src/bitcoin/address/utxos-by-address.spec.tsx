import { mockInscriptionsList } from '../../../test/mock-inscriptions';
import { mockUtxos } from '../../../test/mock-utxos';
import { filterUtxosWithInscriptions } from './utxos-by-address.hooks';

describe(filterUtxosWithInscriptions, () => {
  test('that it filters out utxos with inscriptions so they are not spent', () => {
    const filteredUtxos = mockUtxos.filter(filterUtxosWithInscriptions(mockInscriptionsList));
    expect(filteredUtxos).toEqual([]);
  });
});
