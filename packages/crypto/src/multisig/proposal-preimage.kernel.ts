import * as P from 'micro-packed';

import { strictText } from '@leather.io/utils/kernel';

export const proposalPreimageCodec = P.tuple([
  strictText(P.U32BE),
  strictText(P.U32BE),
  P.bytes(P.U32BE),
  P.apply(P.U64BE, P.coders.numberBigint),
]);
