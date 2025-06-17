import Transport from '@ledgerhq/hw-transport-webusb';
import BitcoinApp, { DefaultWalletPolicy } from 'ledger-bitcoin';

import {
  getNativeSegwitAccountDerivationPath,
  getTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import type { BitcoinNetworkModes } from '@leather.io/models';

import type { WalletPolicyDetails } from './types';
import { LEDGER_APPS_MAP, promptOpenAppOnDevice } from './utils';

export function connectLedgerBitcoinApp(network: BitcoinNetworkModes) {
  return async function connectLedgerBitcoinAppImpl() {
    if (network === 'mainnet') {
      await promptOpenAppOnDevice(LEDGER_APPS_MAP.BITCOIN_MAINNET);
    } else if (network === 'testnet') {
      await promptOpenAppOnDevice(LEDGER_APPS_MAP.BITCOIN_TESTNET);
    }

    const transport = await Transport.create();
    return new BitcoinApp(transport);
  };
}

export function createNativeSegwitDefaultWalletPolicy(
  policyDetails: WalletPolicyDetails
): DefaultWalletPolicy {
  return {
    name: 'Native SegWit',
    version: 0,
    descriptor: `wpkh(@0/**)`,
    keys: [
      {
        masterFingerprint: Buffer.from(policyDetails.fingerprint, 'hex'),
        path: getNativeSegwitAccountDerivationPath(
          policyDetails.network,
          policyDetails.accountIndex
        ),
        xpub: policyDetails.xpub,
      },
    ],
  };
}

export function createTaprootDefaultWalletPolicy(
  policyDetails: WalletPolicyDetails
): DefaultWalletPolicy {
  return {
    name: 'Taproot',
    version: 0,
    descriptor: `tr(@0/**)`,
    keys: [
      {
        masterFingerprint: Buffer.from(policyDetails.fingerprint, 'hex'),
        path: getTaprootAccountDerivationPath(policyDetails.network, policyDetails.accountIndex),
        xpub: policyDetails.xpub,
      },
    ],
  };
}
