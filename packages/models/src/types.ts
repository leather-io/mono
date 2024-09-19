import { LiteralUnion } from './types.utils';

export type Blockchain = LiteralUnion<'bitcoin' | 'stacks', string>;
