import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import {
  BESTINSLOT_API_BASE_URL_MAINNET,
  BESTINSLOT_API_BASE_URL_TESTNET,
  BitcoinNetworkModes,
} from '@leather.io/models';
import { whenNetwork } from '@leather.io/utils';

export function getBestInSlotBasePath(networkMode: BitcoinNetworkModes) {
  return whenNetwork(bitcoinNetworkModeToCoreNetworkMode(networkMode))({
    mainnet: BESTINSLOT_API_BASE_URL_MAINNET,
    testnet: BESTINSLOT_API_BASE_URL_TESTNET,
  });
}
