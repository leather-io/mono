import { BisInscription } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { mapBisInscriptionToCreateInscriptionData } from './collectibles.utils';

describe(mapBisInscriptionToCreateInscriptionData.name, () => {
  const mockBisInscription = {
    inscription_id: 'insc1',
    inscription_number: 1,
    content_url: 'https://example.com/1',
    mime_type: 'image/png',
    owner_wallet_addr: 'bc1pabc',
    satpoint: 'abc:0:0',
    genesis_block_hash: 'hash1',
    genesis_ts: '2025-01-01',
    genesis_height: 100,
    last_transfer_block_height: 120,
    output_value: 1000,
  } as BisInscription;

  it('maps fields as expected', () => {
    const createInscriptionData = mapBisInscriptionToCreateInscriptionData(mockBisInscription);
    expect(createInscriptionData.id).toEqual(mockBisInscription.inscription_id);
    expect(createInscriptionData.number).toEqual(mockBisInscription.inscription_number);
    expect(createInscriptionData.contentSrc).toEqual(mockBisInscription.content_url);
    expect(createInscriptionData.mimeType).toEqual(mockBisInscription.mime_type);
    expect(createInscriptionData.ownerAddress).toEqual(mockBisInscription.owner_wallet_addr);
    expect(createInscriptionData.satPoint).toEqual(mockBisInscription.satpoint);
    expect(createInscriptionData.genesisBlockHash).toEqual(mockBisInscription.genesis_block_hash);
    expect(createInscriptionData.genesisBlockHeight).toEqual(mockBisInscription.genesis_height);
    expect(createInscriptionData.genesisTimestamp).toEqual(mockBisInscription.genesis_ts);
    expect(createInscriptionData.outputValue).toEqual(mockBisInscription.output_value.toString());
  });

  it('uses delegate object fields when available', () => {
    const delegate = {
      mime_type: 'text/html',
      content_url: 'https://other.example.com/2',
    };
    const createInscriptionData = mapBisInscriptionToCreateInscriptionData({
      ...mockBisInscription,
      delegate,
    } as BisInscription);
    expect(createInscriptionData.mimeType).toEqual(delegate.mime_type);
    expect(createInscriptionData.contentSrc).toEqual(delegate.content_url);
  });
});
