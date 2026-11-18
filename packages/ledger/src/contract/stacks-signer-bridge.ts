import type {
  StacksSignMessageFn,
  StacksSignStructuredMessageFn,
  StacksSignerFn,
} from '@leather.io/stacks';

import type { HardwareStacksKey, HardwareStacksSigner } from './hardware-wallet';
import type { OperationContext } from './hardware-wallet-interaction';

export interface HardwareStacksSignerFns {
  sign: StacksSignerFn;
  signMessage: StacksSignMessageFn;
  signStructuredMessage: StacksSignStructuredMessageFn;
}

export function createStacksSignerFnsFromHardwareWallet(
  signer: HardwareStacksSigner,
  key: HardwareStacksKey,
  ctx: OperationContext
): HardwareStacksSignerFns {
  return {
    sign(transaction) {
      return signer.signTransaction({ transaction, key }, ctx);
    },
    signMessage(message) {
      return signer.signMessage({ message, key }, ctx);
    },
    signStructuredMessage(message, domain) {
      return signer.signStructuredMessage({ message, domain, key }, ctx);
    },
  };
}
