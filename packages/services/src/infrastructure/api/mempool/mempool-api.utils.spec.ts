import { NetworkConfiguration, defaultNetworksKeyedById } from '@leather.io/models';

import { UserSettings } from '../../settings/settings.service';
import { getMempoolUrlFromUserSettings, shouldReadBitcoinFromMempool } from './mempool-api.utils';

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

  it('returns the configured bitcoin url for sbtc networks', () => {
    expect(
      getMempoolUrlFromUserSettings(makeUserSettings(defaultNetworksKeyedById.sbtcTestnet))
    ).toEqual(defaultNetworksKeyedById.sbtcTestnet.chain.bitcoin.bitcoinUrl);
    expect(
      getMempoolUrlFromUserSettings(makeUserSettings(defaultNetworksKeyedById.sbtcDevenv))
    ).toEqual(defaultNetworksKeyedById.sbtcDevenv.chain.bitcoin.bitcoinUrl);
  });

  it('returns the configured bitcoin url for the private-1 network', () => {
    expect(
      getMempoolUrlFromUserSettings(makeUserSettings(defaultNetworksKeyedById['private-1']))
    ).toEqual(defaultNetworksKeyedById['private-1'].chain.bitcoin.bitcoinUrl);
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

describe(shouldReadBitcoinFromMempool.name, () => {
  it.each(['mainnet', 'testnet', 'testnet4', 'signet'] as const)(
    'reads %s from the leather api',
    networkId => {
      expect(
        shouldReadBitcoinFromMempool(makeUserSettings(defaultNetworksKeyedById[networkId]))
      ).toBe(false);
    }
  );

  it('reads the staking testnet from its own mempool', () => {
    expect(
      shouldReadBitcoinFromMempool(makeUserSettings(defaultNetworksKeyedById.stakingTestnet))
    ).toBe(true);
  });

  it.each(['private-1', 'sbtcTestnet', 'sbtcDevenv', 'devnet'] as const)(
    'reads regtest network %s from its own mempool',
    networkId => {
      expect(
        shouldReadBitcoinFromMempool(makeUserSettings(defaultNetworksKeyedById[networkId]))
      ).toBe(true);
    }
  );

  it('reads a regtest custom network from its own mempool', () => {
    expect(shouldReadBitcoinFromMempool(makeUserSettings(customNetwork))).toBe(true);
  });

  it('keeps a non-regtest custom network on the leather api', () => {
    const customSignetNetwork: NetworkConfiguration = {
      ...customNetwork,
      chain: {
        ...customNetwork.chain,
        bitcoin: { ...customNetwork.chain.bitcoin, bitcoinNetwork: 'signet', mode: 'signet' },
      },
    };
    expect(shouldReadBitcoinFromMempool(makeUserSettings(customSignetNetwork))).toBe(false);
  });
});
