import { CryptoAssetCategories, CryptoAssetChains, CryptoAssetProtocols } from '@leather.io/models';

import { CreateInscriptionData, createInscriptionCryptoAssetInfo } from './inscription-helpers';

describe(createInscriptionCryptoAssetInfo.name, () => {
  const mockCreateInscriptionData: CreateInscriptionData = {
    id: 'inscr1',
    number: 1,
    contentSrc: 'https://exmaple.com/1',
    mimeType: 'image/svg',
    ownerAddress: 'bc1pabc',
    satPoint: 'abc:0:1',
    genesisBlockHash: 'hash1',
    genesisBlockHeight: 100,
    genesisTimestamp: '2025-01-01T12:00:00.000Z',
    outputValue: '1000',
  };

  it('populates inscription data on asset as expected', () => {
    const inscription = createInscriptionCryptoAssetInfo(mockCreateInscriptionData);

    expect(inscription.chain).toEqual(CryptoAssetChains.bitcoin);
    expect(inscription.category).toEqual(CryptoAssetCategories.nft);
    expect(inscription.protocol).toEqual(CryptoAssetProtocols.inscription);
    expect(inscription.id).toEqual(mockCreateInscriptionData.id);
    expect(inscription.number).toEqual(mockCreateInscriptionData.number);
    expect(inscription.txid).toEqual('abc');
    expect(inscription.output).toEqual('0');
    expect(inscription.offset).toEqual('1');
    expect(inscription.address).toEqual(mockCreateInscriptionData.ownerAddress);
    expect(inscription.preview.includes(mockCreateInscriptionData.id)).toBe(true);
    expect(inscription.title.includes(mockCreateInscriptionData.number.toString())).toBe(true);
    expect(inscription.genesisBlockHash).toEqual(mockCreateInscriptionData.genesisBlockHash);
    expect(inscription.genesisBlockHeight).toEqual(mockCreateInscriptionData.genesisBlockHeight);
    expect(inscription.genesisTimestamp).toEqual(1735732800);
    expect(inscription.value).toEqual(mockCreateInscriptionData.outputValue);
    expect(inscription.mimeType).toEqual('svg');
  });
});
