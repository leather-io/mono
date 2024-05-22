import { InscriptionMimeType } from './bitcoin/inscription.model';

export interface BaseCryptoAssetInfo {
  readonly decimals: number;
  readonly hasMemo: boolean;
}

export interface BtcCryptoAssetInfo extends BaseCryptoAssetInfo {
  readonly name: 'bitcoin';
  readonly symbol: 'BTC';
}

export interface StxCryptoAssetInfo extends BaseCryptoAssetInfo {
  readonly name: 'stacks';
  readonly symbol: 'STX';
}

// Bitcoin
export interface Brc20CryptoAssetInfo extends BaseCryptoAssetInfo {
  readonly name: 'brc-20';
  readonly symbol: string;
}

export interface InscriptionCryptoAssetInfo {
  readonly id: string;
  readonly mimeType: InscriptionMimeType;
  readonly name: 'inscription';
  readonly number: number;
}

export interface RuneCryptoAssetInfo extends BaseCryptoAssetInfo {
  readonly name: 'rune';
  readonly spacedRuneName: string;
  readonly runeName: string;
  readonly symbol: string;
}

export interface StampCryptoAssetInfo {
  readonly name: 'stamp';
  readonly stamp: number;
  readonly stampUrl: string;
}

export interface Src20CryptoAssetInfo extends BaseCryptoAssetInfo {
  readonly id: string;
  readonly name: 'src-20';
  readonly symbol: string;
}

// Stacks
export interface Sip9CryptoAssetInfo {
  readonly contractId: string;
  readonly contractName: string;
  readonly imageCanonicalUri: string;
  readonly name: string;
}

export interface Sip10CryptoAssetInfo extends BaseCryptoAssetInfo {
  readonly canTransfer: boolean;
  readonly contractId: string;
  readonly contractName: string;
  readonly contractAddress: string;
  readonly contractAssetName: string;
  readonly imageCanonicalUri: string;
  readonly tokenName: string;
  readonly symbol: string;
}

export interface Stx20CryptoAssetInfo {
  readonly name: 'stx-20';
  readonly symbol: string;
}
