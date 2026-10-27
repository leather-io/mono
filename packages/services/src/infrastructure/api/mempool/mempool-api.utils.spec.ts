import { NetworkConfiguration, defaultNetworksKeyedById } from '@leather.io/models';

import { UserSettings } from '../../settings/settings.service';
import { getMempoolUrlFromUserSettings } from './mempool-api.utils';

const customNetwork: NetworkConfiguration = {
  id: 'private',
  name: 'Private',
  chain: {
    stacks: {
      blockchain: 'stacks',
      url: 'https://api.private-1.hiro.so',
      chainId: 256,
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinUrl: 'https://mempool.bitcoin.private-1.hiro.so/api',
      bitcoinNetwork: 'regtest',
      mode: 'regtest',
    },
  },
};

function makeUserSettings(network: NetworkConfiguration): UserSettings {
  return {
    quoteCurrency: 'USD',
    network,
    assetVisibility: {},
  };
}

describe(getMempoolUrlFromUserSettings.name, () => {
  it('returns null for default networks', () => {
    expect(getMempoolUrlFromUserSettings(makeUserSettings(defaultNetworksKeyedById.mainnet))).toBe(
      null
    );
    expect(getMempoolUrlFromUserSettings(makeUserSettings(defaultNetworksKeyedById.testnet))).toBe(
      null
    );
    expect(getMempoolUrlFromUserSettings(makeUserSettings(defaultNetworksKeyedById.devnet))).toBe(
      null
    );
  });

  it('returns the configured bitcoin url for the primary testnet and sbtc devenv', () => {
    expect(
      getMempoolUrlFromUserSettings(makeUserSettings(defaultNetworksKeyedById.primaryStacksTestnet))
    ).toEqual(defaultNetworksKeyedById.primaryStacksTestnet.chain.bitcoin.bitcoinUrl);
    expect(
      getMempoolUrlFromUserSettings(makeUserSettings(defaultNetworksKeyedById.sbtcDevenv))
    ).toEqual(defaultNetworksKeyedById.sbtcDevenv.chain.bitcoin.bitcoinUrl);
  });

  it('returns the configured bitcoin url for the staking testnet network', () => {
    expect(
      getMempoolUrlFromUserSettings(makeUserSettings(defaultNetworksKeyedById.stakingTestnet))
    ).toEqual(defaultNetworksKeyedById.stakingTestnet.chain.bitcoin.bitcoinUrl);
  });

  it('returns the configured bitcoin url for user-added custom networks', () => {
    expect(getMempoolUrlFromUserSettings(makeUserSettings(customNetwork))).toEqual(
      'https://mempool.bitcoin.private-1.hiro.so/api'
    );
  });
});
