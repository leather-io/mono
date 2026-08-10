import type { TransactionInput } from '@scure/btc-signer/psbt';

import type { Money } from '@leather.io/models';

export interface SignPsbtArgs {
  addressNativeSegwitTotal?: Money;
  addressTaprootTotal?: Money;
  fee?: Money;
  inputs: TransactionInput[];
}
