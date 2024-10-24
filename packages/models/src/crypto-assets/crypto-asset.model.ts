import { MarketData } from '../market.model';
import { CryptoAssetBalance } from './crypto-asset-balance.model';
import {
  Brc20CryptoAssetInfo,
  BtcCryptoAssetInfo,
  CryptoAssetInfo,
  InscriptionCryptoAssetInfo,
  RuneCryptoAssetInfo,
  Sip9CryptoAssetInfo,
  Sip10CryptoAssetInfo,
  StampCryptoAssetInfo,
  StxCryptoAssetInfo,
} from './crypto-asset-info.model';

export type CryptoAssetCategory = 'fungible' | 'collectible';

export type CryptoAssetType = FungibleCryptoAssetType | CollectibleCryptoAssetType;

interface BaseCryptoAsset {
  category: CryptoAssetCategory;
  type: CryptoAssetType;
  info: CryptoAssetInfo;
  balance?: CryptoAssetBalance;
  marketData?: MarketData;
}

export type CollectibleCryptoAssetType = 'stamp' | 'sip-9' | 'inscription';

interface BaseCollectibleCryptoAsset extends BaseCryptoAsset {
  category: 'collectible';
  type: CollectibleCryptoAssetType;
}
export interface StampCryptoAsset extends BaseCollectibleCryptoAsset {
  type: 'stamp';
  info: StampCryptoAssetInfo;
}
export interface InscriptionCryptoAsset extends BaseCollectibleCryptoAsset {
  type: 'inscription';
  info: InscriptionCryptoAssetInfo;
}
export interface Sip9CryptoAsset extends BaseCollectibleCryptoAsset {
  type: 'sip-9';
  info: Sip9CryptoAssetInfo;
}
export type CollectibleCryptoAsset = StampCryptoAsset | InscriptionCryptoAsset | Sip9CryptoAsset;

export type FungibleCryptoAssetType = 'bitcoin-btc' | 'stacks-stx' | 'sip-10' | 'brc-20' | 'rune';

interface BaseFungibleCryptoAsset extends BaseCryptoAsset {
  category: 'fungible';
  type: FungibleCryptoAssetType;
}
export interface BtcCryptoAsset extends BaseFungibleCryptoAsset {
  type: 'bitcoin-btc';
  info: BtcCryptoAssetInfo;
}
export interface StxCryptoAsset extends BaseFungibleCryptoAsset {
  type: 'stacks-stx';
  info: StxCryptoAssetInfo;
}
export interface Sip10CryptoAsset extends BaseFungibleCryptoAsset {
  type: 'sip-10';
  info: Sip10CryptoAssetInfo;
}
export interface Brc20CryptoAsset extends BaseFungibleCryptoAsset {
  type: 'brc-20';
  info: Brc20CryptoAssetInfo;
}
export interface RuneCryptoAsset extends BaseFungibleCryptoAsset {
  type: 'rune';
  info: RuneCryptoAssetInfo;
}
export type FungibleCryptoAsset =
  | BtcCryptoAsset
  | StxCryptoAsset
  | Sip10CryptoAsset
  | Brc20CryptoAsset
  | RuneCryptoAsset;

export type CryptoAsset = CollectibleCryptoAsset | FungibleCryptoAsset;
