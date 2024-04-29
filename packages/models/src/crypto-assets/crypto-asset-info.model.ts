import { InscriptionMimeType } from './bitcoin/inscription.model';

export interface CryptoAssetInfo {
  readonly decimals: number;
  readonly hasMemo: boolean;
}

export interface BtcCryptoAssetInfo extends CryptoAssetInfo {
  readonly name: 'bitcoin';
  readonly symbol: 'BTC';
}

export interface StxCryptoAssetInfo extends CryptoAssetInfo {
  readonly name: 'stacks';
  readonly symbol: 'STX';
}

/**
 * Bitcoin
 */
export interface Brc20CryptoAssetInfo extends CryptoAssetInfo {
  readonly name: 'brc-20';
  readonly symbol: string;
}

export interface InscriptionCryptoAssetInfo {
  readonly id: string;
  readonly mimeType: InscriptionMimeType;
  readonly name: 'inscription';
  readonly number: number;
  readonly src: string;
}

export interface RuneCryptoAssetInfo extends CryptoAssetInfo {
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

export interface Src20CryptoAssetInfo extends CryptoAssetInfo {
  readonly id: string;
  readonly name: 'src-20';
  readonly symbol: string;
}

/**
 * Stacks
 */
export interface Sip009CryptoAssetInfo {
  readonly contractAddress: string;
  readonly contractName: string;
  readonly imageCanonicalUri: string;
  readonly name: string;
}

export interface Sip010CryptoAssetInfo extends CryptoAssetInfo {
  readonly canTransfer: boolean;
  readonly contractAddress: string;
  readonly contractName: string;
  readonly imageCanonicalUri: string;
  readonly name: string;
  readonly symbol: string;
}

export interface Stx20CryptoAssetInfo {
  readonly name: 'stx-20';
  readonly symbol: string;
}
