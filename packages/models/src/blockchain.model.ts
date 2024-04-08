import type { LiteralUnion } from '@leather-wallet/types';

export type Blockchains = LiteralUnion<'bitcoin' | 'stacks', string>;
