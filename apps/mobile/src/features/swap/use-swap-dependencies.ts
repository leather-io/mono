import { signTx } from '@/features/psbt-signer/signer';
import { useAccountRequest } from '@/hooks/use-account-request';
import { useBitcoinClient } from '@/queries/clients/bitcoin-client';
import { useNextNonce } from '@/queries/stacks/nonce/account-nonces.hooks';
import { broadcastStacksTransaction } from '@/queries/stacks/use-broadcast-stacks-transaction';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { SbtcApiClientMainnet, SbtcApiClientTestnet } from 'sbtc';

import {
  getBitcoinCoinSelectionService,
  getBitcoinTransactionFeesService,
  getMarketDataService,
  getStacksTransactionFeesService,
  getSwapService,
} from '@leather.io/services';
import { SwapDependencies } from '@leather.io/state/swap';
import { assertExistence } from '@leather.io/utils';

const sbtcClientMainnet = new SbtcApiClientMainnet({});
const sbtcClientTestnet = new SbtcApiClientTestnet({});

export function useSwapDependencies(): SwapDependencies {
  const accountRequest = useAccountRequest();
  const { fingerprint, accountIndex } = accountRequest.account.id;
  const stacksNetwork = useNetworkPreferenceStacksNetwork();
  const { networkPreference } = useSettings();
  const { fromAccountIndex } = useStacksSigners();
  const stacksSigner = fromAccountIndex(fingerprint, accountIndex)[0];
  const bitcoinAccounts = useBitcoinAccounts();
  const { nativeSegwit } = bitcoinAccounts.accountIndexByPaymentType(fingerprint, accountIndex);
  const bitcoinPayer = nativeSegwit?.derivePayer({ change: 0, addressIndex: 0 });
  const { broadcastBitcoinTransaction } = useBroadcastBitcoinTransation();
  const { data: nextNonce } = useNextNonce(stacksSigner?.address ?? '');

  assertExistence(stacksSigner, 'Stacks signer missing during swap initialization');
  assertExistence(bitcoinPayer, 'Bitcoin payer missing during swap initialization.');

  const sbtcClient =
    networkPreference.chain.bitcoin.mode === 'mainnet' ? sbtcClientMainnet : sbtcClientTestnet;

  return {
    accountRequest,
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
      broadcast: broadcastStacksTransaction,
      nextNonce,
    },
    bitcoin: {
      network: networkPreference,
      bitcoinPayer,
      sbtcClient,
      signBitcoinPsbt: signTx,
      broadcast: broadcastBitcoinTransaction,
    },
  };
}

// Forked from apps/mobile/src/queries/transaction/use-bitcoin-broadcast-transaction.ts
// for useMutation compatibility.
function useBroadcastBitcoinTransation() {
  const client = useBitcoinClient();

  async function broadcastBitcoinTransaction(tx: string) {
    const response = await client.transactionsApi.broadcastTransaction(tx);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Broadcast failed: ${response.status}`);
    }

    return response.text();
  }

  return { broadcastBitcoinTransaction };
}
