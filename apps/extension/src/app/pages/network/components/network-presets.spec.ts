import { MEMPOOL_BASE_URL } from '@leather.io/constants';
import {
  BITCOIN_API_BASE_URL_MAINNET,
  BITCOIN_API_BASE_URL_TESTNET3,
  BITCOIN_API_BASE_URL_TESTNET4,
} from '@leather.io/models';

import {
  bitcoinNetworkPresets,
  getSelectedNetworkLabel,
  getSelectedNetworkValue,
  networks,
} from './network-presets';

const customNetworkLabel = 'Custom';

describe('bitcoinNetworkPresets', () => {
  it('maps each preset to the exact URLs the form previously hardcoded', () => {
    expect(bitcoinNetworkPresets.mainnet).toEqual({
      label: 'Mainnet',
      bitcoinUrl: BITCOIN_API_BASE_URL_MAINNET,
      stacksUrl: 'https://api.hiro.so',
    });
    expect(bitcoinNetworkPresets.testnet3).toEqual({
      label: 'Testnet3',
      bitcoinUrl: BITCOIN_API_BASE_URL_TESTNET3,
      stacksUrl: 'https://api.testnet.hiro.so',
    });
    expect(bitcoinNetworkPresets.testnet4).toEqual({
      label: 'Testnet4',
      bitcoinUrl: BITCOIN_API_BASE_URL_TESTNET4,
      stacksUrl: 'https://api.testnet.hiro.so',
    });
    expect(bitcoinNetworkPresets.signet).toEqual({
      label: 'Signet',
      bitcoinUrl: `${MEMPOOL_BASE_URL}/signet/api`,
      stacksUrl: 'https://api.testnet.hiro.so',
    });
    expect(bitcoinNetworkPresets.regtest).toEqual({
      label: 'Regtest',
      bitcoinUrl: `${MEMPOOL_BASE_URL}/testnet/api`,
      stacksUrl: 'https://api.testnet.hiro.so',
    });
  });

  it('exposes one selectable option per preset and no Custom option', () => {
    expect(networks).toHaveLength(5);
    expect(networks.map(option => option.value)).toEqual([
      'mainnet',
      'testnet3',
      'testnet4',
      'signet',
      'regtest',
    ]);
    expect(networks.some(option => option.label === customNetworkLabel)).toBe(false);
  });
});

describe('getSelectedNetworkLabel', () => {
  it('returns the preset label when both URLs match the selected preset', () => {
    expect(
      getSelectedNetworkLabel({
        bitcoinNetwork: 'mainnet',
        bitcoinUrl: bitcoinNetworkPresets.mainnet.bitcoinUrl,
        stacksUrl: bitcoinNetworkPresets.mainnet.stacksUrl,
      })
    ).toBe('Mainnet');

    expect(
      getSelectedNetworkLabel({
        bitcoinNetwork: 'signet',
        bitcoinUrl: bitcoinNetworkPresets.signet.bitcoinUrl,
        stacksUrl: bitcoinNetworkPresets.signet.stacksUrl,
      })
    ).toBe('Signet');
  });

  it('returns Custom when the Bitcoin API URL is edited away from the preset', () => {
    expect(
      getSelectedNetworkLabel({
        bitcoinNetwork: 'mainnet',
        bitcoinUrl: 'https://my-own-node.example/api',
        stacksUrl: bitcoinNetworkPresets.mainnet.stacksUrl,
      })
    ).toBe(customNetworkLabel);
  });

  it('returns Custom when the Stacks API URL is edited away while Bitcoin URL still matches', () => {
    expect(
      getSelectedNetworkLabel({
        bitcoinNetwork: 'mainnet',
        bitcoinUrl: bitcoinNetworkPresets.mainnet.bitcoinUrl,
        stacksUrl: 'https://my-own-stacks.example',
      })
    ).toBe(customNetworkLabel);
  });

  it('returns the preset label again once both URLs are reverted to match', () => {
    const reverted = getSelectedNetworkLabel({
      bitcoinNetwork: 'testnet4',
      bitcoinUrl: bitcoinNetworkPresets.testnet4.bitcoinUrl,
      stacksUrl: bitcoinNetworkPresets.testnet4.stacksUrl,
    });
    expect(reverted).toBe('Testnet4');
  });

  it('returns Custom for the blank initial state before URLs are filled', () => {
    expect(
      getSelectedNetworkLabel({ bitcoinNetwork: 'mainnet', bitcoinUrl: '', stacksUrl: '' })
    ).toBe(customNetworkLabel);
  });
});

describe('getSelectedNetworkValue', () => {
  it('returns the preset value when both URLs match the selected preset', () => {
    expect(
      getSelectedNetworkValue({
        bitcoinNetwork: 'mainnet',
        bitcoinUrl: bitcoinNetworkPresets.mainnet.bitcoinUrl,
        stacksUrl: bitcoinNetworkPresets.mainnet.stacksUrl,
      })
    ).toBe('mainnet');
  });

  it('returns an empty string when a URL is edited away from the preset', () => {
    expect(
      getSelectedNetworkValue({
        bitcoinNetwork: 'mainnet',
        bitcoinUrl: 'https://my-own-node.example/api',
        stacksUrl: bitcoinNetworkPresets.mainnet.stacksUrl,
      })
    ).toBe('');

    expect(
      getSelectedNetworkValue({
        bitcoinNetwork: 'mainnet',
        bitcoinUrl: bitcoinNetworkPresets.mainnet.bitcoinUrl,
        stacksUrl: 'https://my-own-stacks.example',
      })
    ).toBe('');
  });

  it('returns an empty string for the blank initial state', () => {
    expect(
      getSelectedNetworkValue({ bitcoinNetwork: 'mainnet', bitcoinUrl: '', stacksUrl: '' })
    ).toBe('');
  });
});
