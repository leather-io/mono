// Mock accounts for the sendTransfer approval. Coins are listed per address
// type in sats so the playground can run the same largest-first coin
// selection the wallet uses, and each board shows numbers that add up.
export type AddressTypeId = 'nativeSegwit' | 'taproot';

export interface AddressTypeSource {
  id: AddressTypeId;
  label: string;
  address: string;
  inputVbytes: number;
  mayHoldCollectibles: boolean;
  coins: number[];
}

export interface SpendingScenario {
  accountName: string;
  accountAvatarSeed: string;
  requester: string;
  recipient: string;
  amountSats: number;
  sources: AddressTypeSource[];
}

const nativeSegwitAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx4f2a';
const taprootAddress = 'bc1pqpzry9x8gf2tvdw0s3jn54khce6mua7lqpzry9x8gf2tvdw0s3jn549c81';
const sbtcDepositRecipient = 'bc1qr8me8t9gu9g6fu926ry5v44yp0wyljrespjtnz';
const sbtcBridgeOrigin = 'https://sbtc.stacks.co';

const p2wpkhInputVbytes = 68;
const p2trInputVbytes = 58;

function createNativeSegwitSource(coins: number[]): AddressTypeSource {
  return {
    id: 'nativeSegwit',
    label: 'Native SegWit',
    address: nativeSegwitAddress,
    inputVbytes: p2wpkhInputVbytes,
    mayHoldCollectibles: false,
    coins,
  };
}

function createTaprootSource(coins: number[]): AddressTypeSource {
  return {
    id: 'taproot',
    label: 'Taproot',
    address: taprootAddress,
    inputVbytes: p2trInputVbytes,
    mayHoldCollectibles: true,
    coins,
  };
}

const baseScenario = {
  accountName: 'Account 1',
  accountAvatarSeed: `${nativeSegwitAddress}-0`,
  requester: sbtcBridgeOrigin,
  recipient: sbtcDepositRecipient,
  amountSats: 442_000,
};

// The incident: Native SegWit runs short, so largest-first selection walks
// into Taproot. Neither type covers the deposit alone, so both are required.
export const mixedAddressTypesScenario: SpendingScenario = {
  ...baseScenario,
  sources: [
    createNativeSegwitSource([301_000, 111_000]),
    createTaprootSource([32_000, 10_000, 10_000]),
  ],
};

// The avoidable case: the single largest coin sits on Taproot, so
// largest-first selection spends it even though Native SegWit could cover the
// deposit alone. Taproot can be switched off for a slightly higher fee.
export const taprootAvoidableScenario: SpendingScenario = {
  ...baseScenario,
  sources: [
    createNativeSegwitSource([300_000, 200_000]),
    createTaprootSource([350_000, 10_000, 10_000]),
  ],
};
