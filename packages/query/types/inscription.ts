export interface InscriptionResponseHiro {
  address: string;
  content_length: number;
  content_type: string;
  curse_type: string | null;
  genesis_address: string;
  genesis_block_hash: string;
  genesis_block_height: number;
  genesis_fee: string;
  genesis_timestamp: number;
  genesis_tx_id: string;
  id: string;
  location: string;
  mime_type: string;
  number: number;
  offset: string;
  output: string;
  recursive: boolean;
  recursion_refs: string | null;
  sat_coinbase_height: number;
  sat_ordinal: string;
  sat_rarity: string;
  timestamp: number;
  tx_id: string;
  value: string;
}

interface BestinSlotInscriptionDelegateResponse {
  delegate_id: string;
  render_url: string;
  mime_type: string;
  content_url: string;
  bis_url: string;
}

export interface BestinslotInscriptionResponse {
  bis_url: string;
  bitmap_number: number | null;
  collection_name: string | null;
  content_url: string;
  delegate: BestinSlotInscriptionDelegateResponse | null;
  genesis_height: number;
  inscription_id: string;
  inscription_name: string | null;
  inscription_number: number;
  last_sale_price: number | null;
  last_transfer_block_height: number;
  metadata?: any | null;
  mime_type: string;
  owner_wallet_addr: string;
  parent_ids: string[];
  render_url: string | null;
  satpoint: string;
  slug: string | null;
}
