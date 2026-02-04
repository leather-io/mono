import { useMemo } from 'react';

import { type StacksNetwork } from '@stacks/network';
import {
  type StacksTransactionWire,
  type TxBroadcastResultOk,
  broadcastTransaction,
} from '@stacks/transactions';
import { SbtcApiClientMainnet, SbtcApiClientTestnet } from 'sbtc';

import { type BitcoinNativeSegwitPayer } from '@leather.io/bitcoin';
import { type NetworkModes, bitcoinNetworkToNetworkMode } from '@leather.io/models';
import {
  getBitcoinCoinSelectionService,
  getBitcoinTransactionFeesService,
  getMarketDataService,
  getStacksTransactionFeesService,
  getSwapService,
} from '@leather.io/services';
import { type StacksSigner } from '@leather.io/stacks';
import { type SwapDependencies } from '@leather.io/state/swap';
import { assertExistence } from '@leather.io/utils';

import { useBitcoinClient } from '@app/query/bitcoin/clients/bitcoin-client';
import { useNextNonce } from '@app/query/stacks/nonce/account-nonces.hooks';
import { hiroFetchWrapper } from '@app/query/stacks/stacks-client';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useSignBitcoinTx } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentAccountNativeSegwitIndexZeroSignerNullable } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useWalletFingerprint } from '@app/store/in-memory-key/in-memory-key.hooks';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useSignStacksTransaction } from '@app/store/transactions/transaction.hooks';

// This file is mostly vibed to be able to plug useSwapState and move forward with the UI work
// TODO: Needs a careful rewrite.

const sbtcClientMainnet = new SbtcApiClientMainnet({});
const sbtcClientTestnet = new SbtcApiClientTestnet({});

interface BroadcastStacksTransactionParams {
  tx: StacksTransactionWire;
  stacksNetwork: StacksNetwork;
}

async function broadcastStacksTx({
  tx,
  stacksNetwork,
}: BroadcastStacksTransactionParams): Promise<TxBroadcastResultOk> {
  const response = await broadcastTransaction({
    transaction: tx,
    network: stacksNetwork,
    client: { fetch: hiroFetchWrapper },
  });

  if ('error' in response) {
    throw new Error(response.reason);
  }

  if (!response.txid) {
    throw new Error('Broadcast returned no txid');
  }

  return response;
}

export function useSwapDependencies(): SwapDependencies {
  const currentAccountIndex = useCurrentAccountIndex();
  const fingerprint = useWalletFingerprint();
  const accountAddresses = useAccountAddresses(currentAccountIndex);
  const stacksAccount = useCurrentStacksAccount();
  const stacksNetwork = useCurrentStacksNetworkState();
  const network = useCurrentNetwork();
  const signStacksTx = useSignStacksTransaction();
  const { data: nextNonce } = useNextNonce(stacksAccount?.address ?? '');
  const nativeSegwitSigner = useCurrentAccountNativeSegwitIndexZeroSignerNullable();
  const bitcoinClient = useBitcoinClient();
  const signBitcoinTx = useSignBitcoinTx();

  const bitcoinNetworkMode = bitcoinNetworkToNetworkMode(network.chain.bitcoin.bitcoinNetwork);
  const stacksNetworkMode: NetworkModes = bitcoinNetworkMode === 'mainnet' ? 'mainnet' : 'testnet';

  const sbtcClient =
    network.chain.bitcoin.mode === 'mainnet' ? sbtcClientMainnet : sbtcClientTestnet;

  assertExistence(stacksAccount, 'Stacks account missing during swap initialization');
  assertExistence(fingerprint, 'Wallet fingerprint missing during swap initialization');
  assertExistence(nativeSegwitSigner, 'Bitcoin signer missing during swap initialization');

  const stacksSigner: StacksSigner = useMemo(() => {
    return {
      descriptor: '',
      keyOrigin: '',
      derivationPath: '',
      address: stacksAccount.address,
      accountIndex: currentAccountIndex,
      network: stacksNetworkMode,
      publicKey: Uint8Array.from(Buffer.from(stacksAccount.stxPublicKey, 'hex')),
      async sign(tx: StacksTransactionWire) {
        const result = signStacksTx(tx);
        const signed = await Promise.resolve(result);
        if (!signed) throw new Error('Signing cancelled');
        return signed;
      },
      signMessage() {
        throw new Error('signMessage not used in swap');
      },
      signStructuredMessage() {
        throw new Error('signStructuredMessage not used in swap');
      },
    };
  }, [stacksAccount, currentAccountIndex, stacksNetworkMode, signStacksTx]);

  const bitcoinPayer: BitcoinNativeSegwitPayer = useMemo(() => {
    return {
      paymentType: 'p2wpkh',
      network: bitcoinNetworkMode,
      address: nativeSegwitSigner.address,
      keyOrigin: nativeSegwitSigner.derivationPath,
      masterKeyFingerprint: String(fingerprint),
      publicKey: nativeSegwitSigner.publicKey,
      payment: nativeSegwitSigner.payment,
    };
  }, [nativeSegwitSigner, bitcoinNetworkMode, fingerprint]);

  const broadcastBitcoinTransaction = useMemo(() => {
    return async (tx: string) => {
      const response = await bitcoinClient.transactionsApi.broadcastTransaction(tx);
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Broadcast failed: ${response.status}`);
      }
      return response.text();
    };
  }, [bitcoinClient]);

  return {
    accountRequest: { account: accountAddresses },
    services: {
      stacksTransactionFeesService: getStacksTransactionFeesService(),
      marketDataService: getMarketDataService(),
      bitcoinTransactionFeesService: getBitcoinTransactionFeesService(),
      bitcoinCoinSelectionService: getBitcoinCoinSelectionService(),
      swapService: getSwapService(),
    },
    stacks: {
      stacksNetwork,
      stacksSigner,
      broadcast: broadcastStacksTx,
      nextNonce,
    },
    bitcoin: {
      network,
      bitcoinPayer,
      sbtcClient,
      signBitcoinPsbt: async (psbt: Uint8Array) => {
        const result = signBitcoinTx(psbt);
        return Promise.resolve(result);
      },
      broadcast: broadcastBitcoinTransaction,
    },
  };
}
