import type { Account } from '@stacks/wallet-sdk';

import type { AccountId } from '@leather.io/models';

// TODO @kyranjamie
// Remove dependency on wallet-sdk here

// Extending the `Account` type from `@stacks/wallet-sdk`
export type SoftwareStacksAccount = Account &
  AccountId & {
    type: 'software';
    address: string;
    stxPublicKey: string;
    dataPublicKey: string;
  };

export interface HardwareStacksAccount extends AccountId {
  type: 'ledger';
  address: string;
  stxPublicKey: string;
  dataPublicKey: string;
  index: number;
}

export type StacksAccount = SoftwareStacksAccount | HardwareStacksAccount;
