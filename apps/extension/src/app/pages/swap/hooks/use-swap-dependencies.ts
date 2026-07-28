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

import { useRefreshAllAccountData } from '@app/common/hooks/account/use-refresh-all-account-data';
import { useNextNonce } from '@app/query/stacks/nonce/account-nonces.hooks';
import { hiroFetchWrapper } from '@app/query/stacks/stacks-client';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useSignBitcoinTx } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentAccountNativeSegwitIndexZeroPayerNullable } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useSignStacksTransaction } from '@app/store/transactions/transaction.hooks';

// This file is mostly vibed to be able to plug useSwapState and move forward with the UI work
// TODO: Needs a careful rewrite.

const sbtcClientMainnet = new SbtcApiClientMainnet({});
const sbtcClientTestnet = new SbtcApiClientTestnet({});

const accountDataRefreshDelayMs = 250;

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
  const currentAccountId = useCurrentAccountId();
  const accountAddresses = useAccountAddresses(currentAccountId);
  const stacksAccount = useCurrentStacksAccount();
  const stacksNetwork = useCurrentStacksNetworkState();
  const network = useCurrentNetwork();
  const signStacksTx = useSignStacksTransaction();
  const { data: nextNonce } = useNextNonce(stacksAccount?.address ?? '');
  const nativeSegwitSigner = useCurrentAccountNativeSegwitIndexZeroPayerNullable();
  const signBitcoinTx = useSignBitcoinTx();
  const refreshAllAccountData = useRefreshAllAccountData();

  const bitcoinNetworkMode = bitcoinNetworkToNetworkMode(network.chain.bitcoin.bitcoinNetwork);
  const stacksNetworkMode: NetworkModes = bitcoinNetworkMode === 'mainnet' ? 'mainnet' : 'testnet';

  const sbtcClient =
    network.chain.bitcoin.mode === 'mainnet' ? sbtcClientMainnet : sbtcClientTestnet;

  assertExistence(stacksAccount, 'Stacks account missing during swap initialization');
  assertExistence(
    currentAccountId.fingerprint,
    'Wallet fingerprint missing during swap initialization'
  );
  assertExistence(nativeSegwitSigner, 'Bitcoin signer missing during swap initialization');

  const stacksSigner: StacksSigner = useMemo(() => {
    return {
      descriptor: '',
      keyOrigin: '',
      derivationPath: '',
      address: stacksAccount.address,
      accountIndex: currentAccountId.accountIndex,
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
  }, [stacksAccount, currentAccountId, stacksNetworkMode, signStacksTx]);

  const bitcoinPayer: BitcoinNativeSegwitPayer = useMemo(() => {
    return {
      paymentType: 'p2wpkh',
      network: bitcoinNetworkMode,
      address: nativeSegwitSigner.address,
      keyOrigin: nativeSegwitSigner.keyOrigin,
      masterKeyFingerprint: String(currentAccountId.fingerprint),
      publicKey: nativeSegwitSigner.publicKey,
      payment: nativeSegwitSigner.payment,
    };
  }, [nativeSegwitSigner, bitcoinNetworkMode, currentAccountId.fingerprint]);

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
    },
    onSwapSubmitted() {
      void refreshAllAccountData(accountDataRefreshDelayMs);
    },
  };
}
