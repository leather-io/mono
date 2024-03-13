import { LiteralUnion } from '@leather-wallet/utils';

export type Blockchains = LiteralUnion<'bitcoin' | 'stacks', string>;
