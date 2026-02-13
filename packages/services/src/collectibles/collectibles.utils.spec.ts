import { BisInscription } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { isLpToken, mapBisInscriptionToCreateInscriptionData } from './collectibles.utils';

describe(mapBisInscriptionToCreateInscriptionData.name, () => {
  const mockBisInscription = {
    inscription_id: 'insc1',
    inscription_number: 1,
    content_url: 'https://example.com/1',
    render_url: 'https://example.com/preview.png',
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
    expect(createInscriptionData.thumbnailSrc).toEqual(mockBisInscription.render_url);
  });

  it('uses delegate object fields when available', () => {
    const delegate = {
      mime_type: 'text/html',
      content_url: 'https://other.example.com/2',
      render_url: 'https://example.com/preview.png',
    };
    const createInscriptionData = mapBisInscriptionToCreateInscriptionData({
      ...mockBisInscription,
      delegate,
    } as BisInscription);
    expect(createInscriptionData.mimeType).toEqual(delegate.mime_type);
    expect(createInscriptionData.contentSrc).toEqual(delegate.content_url);
    expect(createInscriptionData.thumbnailSrc).toEqual(delegate.render_url);
  });
});

describe(isLpToken.name, () => {
  it('returns true for pool-token-id pattern', () => {
    expect(isLpToken('SP123.velar-v1::pool-token-id')).toBe(true);
    expect(isLpToken('SP456.alex-amm::Pool-Token-Id')).toBe(true);
  });

  it('returns true for lp-token pattern', () => {
    expect(isLpToken('SP123.pool::lp-token')).toBe(true);
    expect(isLpToken('SP456.swap::LP-TOKEN')).toBe(true);
  });

  it('returns true for liquidity-token pattern', () => {
    expect(isLpToken('SP123.dex::liquidity-token')).toBe(true);
    expect(isLpToken('SP456.amm::Liquidity-Token')).toBe(true);
  });

  it('returns true for dlmm-pool- pattern', () => {
    expect(isLpToken('SP123.dlmm-pool-stx-usda::token')).toBe(true);
    expect(isLpToken('SP456.DLMM-POOL-BTC-STX::nft')).toBe(true);
  });

  it('returns true for amm-pool- pattern', () => {
    expect(isLpToken('SP123.amm-pool-v2::share')).toBe(true);
    expect(isLpToken('SP456.AMM-POOL-STX::token')).toBe(true);
  });

  it('returns false for regular NFT identifiers', () => {
    expect(isLpToken('SP123.megapont-ape-club::megapont-ape-club')).toBe(false);
    expect(isLpToken('SP456.bitcoin-monkeys::bitcoin-monkeys')).toBe(false);
    expect(isLpToken('SP789.stacks-punks::stacks-punks')).toBe(false);
  });

  it('returns false for BNS names', () => {
    expect(isLpToken('SP000.bns::names')).toBe(false);
    expect(isLpToken('SP123.bns-v2::bns-names')).toBe(false);
  });

  it('handles case insensitivity', () => {
    expect(isLpToken('SP123.VELAR::POOL-TOKEN-ID')).toBe(true);
    expect(isLpToken('sp123.velar::pool-token-id')).toBe(true);
    expect(isLpToken('Sp123.Velar::Pool-Token-Id')).toBe(true);
  });
});
