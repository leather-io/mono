import type { AccountId } from '@leather.io/models';
import { makeStxDerivationPath } from '@leather.io/stacks';

export interface SoftwareStacksAccount extends AccountId {
  type: 'software';
  index: number;
  address: string;
  stxPublicKey: string;
  stxPrivateKey: string;
  dataPublicKey: string;
  dataPrivateKey: string;
  appsKey: string;
  salt: string;
}

export interface HardwareStacksAccount extends AccountId {
  type: 'ledger';
  address: string;
  stxPublicKey: string;
  dataPublicKey: string;
  index: number;
  derivationPath: string;
}

export type StacksAccount = SoftwareStacksAccount | HardwareStacksAccount;

export function getStacksAccountDerivationPath(account: StacksAccount) {
  return account.type === 'ledger'
    ? account.derivationPath
    : makeStxDerivationPath(account.accountIndex);
}
