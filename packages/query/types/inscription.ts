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
  render_url?: string | null;
  mime_type?: string | null;
  content_url: string;
  bis_url: string;
}

interface BestInSlotInscriptionMetadataResponse {
  name: string;
  [key: string]: any;
}

export interface BestinslotInscriptionResponse {
  inscription_name?: string | null;
  inscription_id: string;
  inscription_number: number;
  parent_ids: string[];
  metadata?: BestInSlotInscriptionMetadataResponse | null;
  owner_wallet_addr: string;
  mime_type?: string | null;
  last_sale_price?: number | null;
  slug?: string | null;
  collection_name?: string | null;
  satpoint: string;
  last_transfer_block_height?: number | null;
  genesis_height: number;
  content_url: string;
  bis_url: string;
  render_url?: string | null;
  bitmap_number?: number | null;
  delegate?: BestinSlotInscriptionDelegateResponse | null;
}
