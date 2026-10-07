import { keys } from 'remeda';

import { MEMPOOL_BASE_URL } from '@leather.io/constants';
import {
  BITCOIN_API_BASE_URL_MAINNET,
  BITCOIN_API_BASE_URL_PRIMARY_TESTNET,
  BITCOIN_API_BASE_URL_TESTNET3,
  BITCOIN_API_BASE_URL_TESTNET4,
  type BitcoinNetwork,
  HIRO_API_BASE_URL_MAINNET,
  HIRO_API_BASE_URL_TESTNET,
} from '@leather.io/models';

interface NetworkPreset {
  label: string;
  bitcoinUrl: string;
  stacksUrl: string;
}

interface NetworkPresetMatchInput {
  bitcoinNetwork: BitcoinNetwork;
  bitcoinUrl: string;
  stacksUrl: string;
}

const customNetworkLabel = 'Custom';

export const bitcoinNetworkPresets: Record<BitcoinNetwork, NetworkPreset> = {
  mainnet: {
    label: 'Mainnet',
    bitcoinUrl: BITCOIN_API_BASE_URL_MAINNET,
    stacksUrl: HIRO_API_BASE_URL_MAINNET,
  },
  regtest: {
    label: 'Primary Hiro Testnet',
    bitcoinUrl: BITCOIN_API_BASE_URL_PRIMARY_TESTNET,
    stacksUrl: HIRO_API_BASE_URL_TESTNET,
  },
  signet: {
    label: 'Signet',
    bitcoinUrl: `${MEMPOOL_BASE_URL}/signet/api`,
    stacksUrl: HIRO_API_BASE_URL_TESTNET,
  },
  testnet4: {
    label: 'Testnet4',
    bitcoinUrl: BITCOIN_API_BASE_URL_TESTNET4,
    stacksUrl: HIRO_API_BASE_URL_TESTNET,
  },
  testnet3: {
    label: 'Testnet3',
    bitcoinUrl: BITCOIN_API_BASE_URL_TESTNET3,
    stacksUrl: HIRO_API_BASE_URL_TESTNET,
  },
};

export const networks: { label: string; value: BitcoinNetwork }[] = keys(bitcoinNetworkPresets)
  .filter(value => value !== 'testnet3')
  .map(value => ({
    label: bitcoinNetworkPresets[value].label,
    value,
  }));

function getMatchingNetwork(values: NetworkPresetMatchInput): BitcoinNetwork | undefined {
  const preset = bitcoinNetworkPresets[values.bitcoinNetwork];

  const matchesPreset =
    values.bitcoinUrl === preset.bitcoinUrl && values.stacksUrl === preset.stacksUrl;

  return matchesPreset ? values.bitcoinNetwork : undefined;
}

export function getSelectedNetworkLabel(values: NetworkPresetMatchInput): string {
  const matched = getMatchingNetwork(values);

  return matched ? bitcoinNetworkPresets[matched].label : customNetworkLabel;
}

export function getSelectedNetworkValue(values: NetworkPresetMatchInput): string {
  return getMatchingNetwork(values) ?? '';
}
