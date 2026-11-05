import { bytesToHex } from '@stacks/common';

import { type StxAddress, stxGetAddresses } from '@leather.io/rpc';

interface FormatAddressesForStxGetAddresses {
  address: string;
  publicKey: Uint8Array;
}

export function formatAddressesForStxGetAddresses({
  address,
  publicKey,
}: FormatAddressesForStxGetAddresses) {
  const stacksAddressResponse: StxAddress = {
    symbol: 'STX',
    kind: 'single-sig',
    address,
    publicKey: bytesToHex(publicKey),
  };

  return stxGetAddresses.result.parse({ addresses: [stacksAddressResponse] });
}
