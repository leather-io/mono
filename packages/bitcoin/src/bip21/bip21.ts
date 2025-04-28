import { Bip21Options, decode, encode } from 'bip21';

import { isError } from '@leather.io/utils';

interface Bip21ResultValue {
  address: string;
  [key: string]: string | number | undefined;
}

type Bip21Result =
  | {
      success: true;
      data: Bip21ResultValue;
    }
  | {
      success: false;
      error: string;
    };

export const bip21 = {
  decode: (uri: string, urnScheme?: string): Bip21Result => {
    try {
      const { address, options } = decode(uri, urnScheme);
      return {
        success: true,
        data: { address, ...options },
      };
    } catch (error) {
      return {
        success: false,
        error: isError(error) ? error.message : 'invalid input',
      };
    }
  },
  encode: (address: string, options: Bip21Options, urnScheme?: string) => {
    try {
      return encode(address, options, urnScheme);
    } catch {
      return null;
    }
  },
};
