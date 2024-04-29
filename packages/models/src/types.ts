import { LiteralUnion } from './types.utils';

export type Blockchains = LiteralUnion<'bitcoin' | 'stacks', string>;

export type CryptoAssetType =
  | 'btc'
  | 'stx'
  | 'brc-20'
  | 'inscription'
  | 'rune'
  | 'sip-009'
  | 'sip-010'
  | 'src-20'
  | 'stamp'
  | 'stx-20';
