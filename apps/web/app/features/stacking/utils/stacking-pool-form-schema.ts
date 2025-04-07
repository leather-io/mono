import { z } from 'zod';

import { isValidBitcoinAddress, isValidBitcoinNetworkAddress } from '@leather.io/bitcoin';
import { BitcoinNetworkModes } from '@leather.io/models';

function btcAddressNetworkValidator(networkMode: BitcoinNetworkModes) {
  return (address: string) => isValidBitcoinNetworkAddress(address, networkMode);
}

interface SchemaCreationParams {
  networkMode: BitcoinNetworkModes;
}

export function createStackingPoolFormSchema({ networkMode }: SchemaCreationParams) {
  return z.object({
    amount: z.string().or(z.number()),
    rewardAddress: z
      .string()
      .refine(isValidBitcoinAddress, 'Address is not valid') // TODO: invalidAddress
      .refine(btcAddressNetworkValidator(networkMode), 'Address is for incorrect network'), // incorrectNetworkAddress
  });
}

export type StackingPoolFormSchema = z.infer<ReturnType<typeof createStackingPoolFormSchema>>;
