import { ClarityValue } from '@stacks/transactions';

import { NetworkModes } from '@leather.io/models';

export interface BnsReadOnlyOptions {
  functionName: string;
  functionArgs: ClarityValue[];
  senderAddress: string;
  network: NetworkModes;
}
export interface GetPrimaryNameOptions {
  address: string;
  network: NetworkModes;
}
