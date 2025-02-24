import {
  BESTINSLOT_API_BASE_URL_MAINNET,
  BESTINSLOT_API_BASE_URL_TESTNET,
  NetworkModes,
} from '@leather.io/models';
import { whenNetwork } from '@leather.io/utils';

export function getBestInSlotBasePath(network: NetworkModes) {
  return whenNetwork(network)({
    mainnet: BESTINSLOT_API_BASE_URL_MAINNET,
    testnet: BESTINSLOT_API_BASE_URL_TESTNET,
  });
}
