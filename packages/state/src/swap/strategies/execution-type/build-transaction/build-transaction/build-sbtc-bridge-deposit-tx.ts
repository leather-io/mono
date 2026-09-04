import type * as btc from '@scure/btc-signer';
import type { P2TROut } from '@scure/btc-signer/payment';
import { bytesToHex } from '@stacks/common';
import {
  DEFAULT_MAX_SIGNER_FEE,
  DEFAULT_RECLAIM_LOCK_TIME,
  MAINNET,
  REGTEST,
  TESTNET,
  buildSbtcDepositTx,
} from 'sbtc';

import { type BitcoinNativeSegwitPayer, ecdsaPublicKeyToSchnorr } from '@leather.io/bitcoin';
import {
  type AccountAddresses,
  type BitcoinNetworkModes,
  type NetworkConfiguration,
} from '@leather.io/models';

interface SbtcDeposit {
  address: string;
  depositScript: string;
  reclaimScript: string;
  transaction: btc.Transaction;
  trOut: P2TROut;
}

export function buildSbtcBridgeDepositTx(
  amountSats: number | bigint,
  network: NetworkConfiguration,
  account: AccountAddresses,
  payer: BitcoinNativeSegwitPayer,
  signersPublicKey: string
): SbtcDeposit {
  return buildSbtcDepositTx({
    amountSats,
    network: getSbtcNetworkConfig(network.chain.bitcoin.mode),
    stacksAddress: account.stacks?.stxAddress ?? '',
    maxSignerFee: DEFAULT_MAX_SIGNER_FEE,
    reclaimLockTime: DEFAULT_RECLAIM_LOCK_TIME,
    reclaimPublicKey: bytesToHex(ecdsaPublicKeyToSchnorr(payer.publicKey)),
    signersPublicKey,
  });
}

function getSbtcNetworkConfig(network: BitcoinNetworkModes) {
  const networkMap = {
    mainnet: MAINNET,
    testnet: TESTNET,
    regtest: REGTEST,
    // Signet supported not tested, but likely uses same values as testnet
    signet: TESTNET,
  };
  return networkMap[network];
}
