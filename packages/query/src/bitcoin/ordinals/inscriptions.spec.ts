import { mockInscriptionResponsesList } from '../../../test/mock-inscriptions';
import { createBestInSlotInscription } from './inscription.utils';
import { findInscriptionsOnUtxo } from './ordinals.utils';

describe(findInscriptionsOnUtxo, () => {
  test('that it finds an inscription on a utxo', () => {
    const foundInscriptions = findInscriptionsOnUtxo({
      index: 0,
      inscriptions: mockInscriptionResponsesList.map(createBestInSlotInscription),
      txId: '0eab3f1cb5f8193867e5b9b22e15e72e260404fc4314050b2d78fe343c7105ca',
    });
    expect(foundInscriptions.length).toEqual(1);
  });
});
