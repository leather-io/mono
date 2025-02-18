import { createBitcoinAddress } from '../validation/bitcoin-address';

// maybe these should be in mono/config?
// from extension/tests/mocks/constants
export const TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS = createBitcoinAddress(
  'bc1q530dz4h80kwlzywlhx2qn0k6vdtftd93c499yq'
);
export const TEST_ACCOUNT_1_TAPROOT_ADDRESS = createBitcoinAddress(
  'bc1putuzj9lyfcm8fef9jpy85nmh33cxuq9u6wyuk536t9kemdk37yjqmkc0pg'
);
export const TEST_ACCOUNT_2_TAPROOT_ADDRESS = createBitcoinAddress(
  'bc1pmk2sacpfyy4v5phl8tq6eggu4e8laztep7fsgkkx0nc6m9vydjesaw0g2r'
);

export const TEST_TESNET_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS = createBitcoinAddress(
  'tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d'
);

export const TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS = createBitcoinAddress(
  'tb1qr8me8t9gu9g6fu926ry5v44yp0wyljrespjtnz'
);

export const TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS = createBitcoinAddress(
  'tb1pve00jmp43whpqj2wpcxtc7m8wqhz0azq689y4r7h8tmj8ltaj87qj2nj6w'
);

// coin-selection.spec
export const recipientAddress = createBitcoinAddress('tb1qt28eagxcl9gvhq2rpj5slg7dwgxae2dn2hk93m');
export const legacyAddress = createBitcoinAddress('15PyZveQd28E2SHZu2ugkWZBp6iER41vXj');
export const segwitAddress = createBitcoinAddress('33SVjoCHJovrXxjDKLFSXo1h3t5KgkPzfH');
export const taprootAddress = createBitcoinAddress(
  'tb1parwmj7533de3k2fw2kntyqacspvhm67qnjcmpqnnpfvzu05l69nsczdywd'
);
export const invalidAddress = 'whoop-de-da-boop-da-de-not-a-bitcoin-address';

export const inValidCharactersAddress = createBitcoinAddress(
  'tb1&*%wmj7533de3k2fw2kntyqacspvhm67qnjcmpqnnpfvzu05l69nsczdywd'
);
export const inValidLengthAddress = createBitcoinAddress('tb1parwmj7533de3k2fw2kntyqacspvhm67wd');
