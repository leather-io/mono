import { StacksSigner } from '@leather.io/stacks';

export function assertStacksSigner(
  signer: StacksSigner | undefined
): asserts signer is StacksSigner {
  if (!signer) throw new Error('No signer found');
}
