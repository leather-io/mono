import {
  BESTINSLOT_API_BASE_URL_MAINNET,
  BESTINSLOT_API_BASE_URL_TESTNET,
} from '@leather.io/models';

import { getBestInSlotBasePath } from './best-in-slot-api.utils';

describe(getBestInSlotBasePath.name, () => {
  it('should should return the correct BIS API base path', () => {
    expect(getBestInSlotBasePath('mainnet')).toBe(BESTINSLOT_API_BASE_URL_MAINNET);
    expect(getBestInSlotBasePath('testnet')).toBe(BESTINSLOT_API_BASE_URL_TESTNET);
    expect(getBestInSlotBasePath('signet')).toBe(BESTINSLOT_API_BASE_URL_TESTNET);
    expect(getBestInSlotBasePath('regtest')).toBe(BESTINSLOT_API_BASE_URL_TESTNET);
  });
});
