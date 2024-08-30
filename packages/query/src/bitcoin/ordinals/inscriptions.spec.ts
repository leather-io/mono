import { mockInscriptionResponsesList } from '../../../test/mock-inscriptions';
import { findInscriptionsOnUtxo } from './inscriptions.hooks';

describe(findInscriptionsOnUtxo, () => {
  test('that it finds an inscription on a utxo', () => {
    const foundInscriptions = findInscriptionsOnUtxo({
      index: 0,
      inscriptions: mockInscriptionResponsesList,
      txId: '0eab3f1cb5f8193867e5b9b22e15e72e260404fc4314050b2d78fe343c7105ca',
    });
    expect(foundInscriptions.length).toEqual(1);
  });
});
