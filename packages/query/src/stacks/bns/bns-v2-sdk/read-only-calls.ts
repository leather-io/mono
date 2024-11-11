import {
  BufferCV,
  ClarityType,
  ClarityValue,
  cvToString,
  getCVTypeString,
  standardPrincipalCV,
} from '@stacks/transactions';

import { bnsV2ReadOnlyCall } from './callers-helper';
import { GetPrimaryNameOptions } from './interfaces';
import { generateRandomAddress } from './utils';

export async function getPrimaryName({
  address,
  network,
}: GetPrimaryNameOptions): Promise<{ name: string; namespace: string } | null> {
  const bnsFunctionName = 'get-primary';
  const randomAddress = generateRandomAddress();
  return bnsV2ReadOnlyCall({
    functionName: bnsFunctionName,
    senderAddress: randomAddress,
    functionArgs: [standardPrincipalCV(address)],
    network,
  }).then((responseCV: ClarityValue) => {
    if (responseCV.type === ClarityType.ResponseOk) {
      if (responseCV.value.type === ClarityType.Tuple) {
        const nameCV = responseCV.value.data['name'] as BufferCV;
        const namespaceCV = responseCV.value.data['namespace'] as BufferCV;
        return {
          name: Buffer.from(nameCV.buffer).toString(),
          namespace: Buffer.from(namespaceCV.buffer).toString(),
        };
      } else if (responseCV.value.type === ClarityType.OptionalSome) {
        const innerValue = responseCV.value.value;
        if (innerValue.type === ClarityType.Tuple) {
          const nameCV = innerValue.data['name'] as BufferCV;
          const namespaceCV = innerValue.data['namespace'] as BufferCV;
          return {
            name: Buffer.from(nameCV.buffer).toString(),
            namespace: Buffer.from(namespaceCV.buffer).toString(),
          };
        }
      }
      throw new Error('Unexpected response structure');
    } else if (responseCV.type === ClarityType.ResponseErr) {
      if (cvToString(responseCV.value) === 'u131') {
        return null;
      }
      throw new Error(cvToString(responseCV.value));
    } else {
      throw new Error(`Unexpected Clarity Value type: ${getCVTypeString(responseCV)}`);
    }
  });
}
