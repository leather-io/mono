import { BestInSlotInscriptionResponse } from '../src/bitcoin/clients/best-in-slot';
import { createBestInSlotInscription } from '../src/bitcoin/ordinals/inscription.utils';

export const mockInscriptionResponse: BestInSlotInscriptionResponse = {
  inscription_name: null,
  inscription_id: 'bcbb27db6062dbd8de71eb77ce6f04b398e6ed04bf1104dd1c9b17b15c291b3di65',
  inscription_number: 72251550,
  parent_ids: [],
  output_value: 546,
  genesis_block_hash: '00000000000000000001f5a31dce8b4ed80ed11824498f8a8b7464985291d134',
  genesis_ts: '2024-07-02T12:59:45.000Z',
  metadata: null,
  owner_wallet_addr: 'bc1pwz9n62p9dhjpqcpdmfcrewdnz3nk8jcved242vd2lj9fgvtvwnwscvdyre',
  mime_type: 'text/plain;charset=utf-8',
  last_sale_price: null,
  slug: null,
  collection_name: null,
  satpoint: 'bcbb27db6062dbd8de71eb77ce6f04b398e6ed04bf1104dd1c9b17b15c291b3d:65:0',
  last_transfer_block_height: 850381,
  genesis_height: 850381,
  content_url:
    'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/bcbb27db6062dbd8de71eb77ce6f04b398e6ed04bf1104dd1c9b17b15c291b3di65',
  bis_url:
    'https://bestinslot.xyz/ordinals/inscription/bcbb27db6062dbd8de71eb77ce6f04b398e6ed04bf1104dd1c9b17b15c291b3di65',
  render_url: null,
  bitmap_number: null,
  delegate: null,
};

export const mockInscription1 = createBestInSlotInscription(mockInscriptionResponse);

export const mockInscriptionResponse2: BestInSlotInscriptionResponse = {
  inscription_name: null,
  inscription_id: 'bcbb27db6062dbd8de71eb77ce6f04b398e6ed04bf1104dd1c9b17b15c291b3di61',
  inscription_number: 72251546,
  parent_ids: [],
  output_value: 546,
  genesis_block_hash: '00000000000000000001f5a31dce8b4ed80ed11824498f8a8b7464985291d134',
  genesis_ts: '2024-07-02T12:59:45.000Z',
  metadata: null,
  owner_wallet_addr: 'bc1pwz9n62p9dhjpqcpdmfcrewdnz3nk8jcved242vd2lj9fgvtvwnwscvdyre',
  mime_type: 'text/plain;charset=utf-8',
  last_sale_price: null,
  slug: null,
  collection_name: null,
  satpoint: 'bcbb27db6062dbd8de71eb77ce6f04b398e6ed04bf1104dd1c9b17b15c291b3d:61:0',
  last_transfer_block_height: 850381,
  genesis_height: 850381,
  content_url:
    'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/bcbb27db6062dbd8de71eb77ce6f04b398e6ed04bf1104dd1c9b17b15c291b3di61',
  bis_url:
    'https://bestinslot.xyz/ordinals/inscription/bcbb27db6062dbd8de71eb77ce6f04b398e6ed04bf1104dd1c9b17b15c291b3di61',
  render_url: null,
  bitmap_number: null,
  delegate: null,
};

export const mockInscription2 = createBestInSlotInscription(mockInscriptionResponse2);

export const mockInscriptionResponse3 = {
  inscription_name: null,
  inscription_id: 'a5ab63799f0bbd2571d1b90de9ebff815f7526787e27263d2f604e22f9118d0ci0',
  inscription_number: 10371348,
  parent_ids: [],
  output_value: 546,
  genesis_block_hash: '00000000000000000003fb85f8ae82f194786416cf699961b04d2953fbbd63d4',
  genesis_ts: '2023-06-01T05:00:57.000Z',
  metadata: null,
  owner_wallet_addr: 'bc1q530dz4h80kwlzywlhx2qn0k6vdtftd93c499yq',
  mime_type: 'text/plain;charset=utf-8',
  last_sale_price: null,
  slug: null,
  collection_name: null,
  satpoint: '58d44000884f0ba4cdcbeb1ac082e6c802d300c16b0d3251738e8cf6a57397ce:0:0',
  last_transfer_block_height: 810183,
  genesis_height: 792337,
  content_url:
    'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/a5ab63799f0bbd2571d1b90de9ebff815f7526787e27263d2f604e22f9118d0ci0',
  bis_url:
    'https://bestinslot.xyz/ordinals/inscription/a5ab63799f0bbd2571d1b90de9ebff815f7526787e27263d2f604e22f9118d0ci0',
  render_url: null,
  bitmap_number: null,
  delegate: null,
};

// non-zero offset
export const mockInscriptionResponseNonZeroOffset: BestInSlotInscriptionResponse = {
  inscription_name: null,
  inscription_id: 'a5ab63799f0bbd2571d1b90de9ebff815f7526787e27263d2f604e22f9118d0ci0',
  inscription_number: 10371348,
  parent_ids: [],
  output_value: 546,
  genesis_block_hash: '00000000000000000003fb85f8ae82f194786416cf699961b04d2953fbbd63d4',
  genesis_ts: '2023-06-01T05:00:57.000Z',
  metadata: null,
  owner_wallet_addr: 'bc1q530dz4h80kwlzywlhx2qn0k6vdtftd93c499yq',
  mime_type: 'text/plain;charset=utf-8',
  last_sale_price: null,
  slug: null,
  collection_name: null,
  satpoint: '58d44000884f0ba4cdcbeb1ac082e6c802d300c16b0d3251738e8cf6a57397ce:0:1',
  last_transfer_block_height: 810183,
  genesis_height: 792337,
  content_url:
    'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/a5ab63799f0bbd2571d1b90de9ebff815f7526787e27263d2f604e22f9118d0ci0',
  bis_url:
    'https://bestinslot.xyz/ordinals/inscription/a5ab63799f0bbd2571d1b90de9ebff815f7526787e27263d2f604e22f9118d0ci0',
  render_url: null,
  bitmap_number: null,
  delegate: null,
};

export const mockInscriptionResponsesList = [
  {
    inscription_name: null,
    inscription_id: '0eab3f1cb5f8193867e5b9b22e15e72e260404fc4314050b2d78fe343c7105cai0',
    inscription_number: 64595760,
    parent_ids: [],
    output_value: 546,
    genesis_block_hash: '000000000000000000027ba2f97360fe4c0b1d9d30426c0505548f6962190a8e',
    genesis_ts: '2024-03-16T09:34:42.000Z',
    metadata: null,
    owner_wallet_addr: 'bc1p8nyc4sl8agqfjs2rq4yer6wnhd89naw05s0ha8hpmg8j36ht6yvswqyaxm',
    mime_type: 'text/plain;charset=utf-8',
    last_sale_price: null,
    slug: null,
    collection_name: null,
    satpoint: '0eab3f1cb5f8193867e5b9b22e15e72e260404fc4314050b2d78fe343c7105ca:0:0',
    last_transfer_block_height: 834905,
    genesis_height: 834905,
    content_url:
      'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/0eab3f1cb5f8193867e5b9b22e15e72e260404fc4314050b2d78fe343c7105cai0',
    bis_url:
      'https://bestinslot.xyz/ordinals/inscription/0eab3f1cb5f8193867e5b9b22e15e72e260404fc4314050b2d78fe343c7105cai0',
    render_url: null,
    bitmap_number: null,
    delegate: null,
  },
];

export const mockInscriptionsList = mockInscriptionResponsesList.map(createBestInSlotInscription);
