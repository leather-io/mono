import { InputSizing } from '@leather.io/bitcoin';
import { AccountAddresses } from '@leather.io/models';

export function getInputSizing(account: AccountAddresses): InputSizing | undefined {
  const { bitcoin } = account;
  if (bitcoin?.type !== 'fixedAddress') return undefined;
  return {
    paymentType: bitcoin.paymentType,
    threshold: bitcoin.multisig.threshold,
    signerCount: bitcoin.multisig.signerCount,
  };
}
