import { ClarityValue } from '@stacks/transactions';

import { NetworkType } from './config';

export interface BnsReadOnlyOptions {
  functionName: string;
  functionArgs: ClarityValue[];
  senderAddress: string;
  network: NetworkType;
}
export interface GetPrimaryNameOptions {
  address: string;
  network: NetworkType;
}
