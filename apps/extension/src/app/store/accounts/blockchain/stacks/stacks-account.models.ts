import type { AccountId } from '@leather.io/models';

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
}

export type StacksAccount = SoftwareStacksAccount | HardwareStacksAccount;
